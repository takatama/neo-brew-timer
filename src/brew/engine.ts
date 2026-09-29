/**
 * A small, framework-free brew clock.
 *
 * It owns elapsed time, the optional lead-in countdown, pause/resume, and the
 * moments when guidance should happen. It knows nothing about recipes, audio
 * or React: it receives `{ atSec, isFinish }` steps and emits cues.
 *
 * Elapsed time is derived from a wall clock anchor, not accumulated from
 * ticks, so a throttled or briefly suspended page catches up correctly.
 */

export interface EngineStep {
  atSec: number;
  isFinish: boolean;
}

export type BrewStatus = "idle" | "countdown" | "running" | "paused" | "done";

export type Cue =
  /** The lead-in before the first pour started (or resumed mid-way). */
  | { type: "countdown"; offsetMs: number }
  /**
   * The lead-in to an upcoming step. `offsetMs` is where to start the
   * five-second clip so that it ends exactly on the step in real time (under
   * a speed-up only its tail plays). `fresh` is false when picking up late,
   * e.g. after resuming inside the lead-in.
   */
  | { type: "approach"; stepIndex: number; isFinish: boolean; offsetMs: number; fresh: boolean }
  /** A step boundary was crossed. */
  | { type: "step"; stepIndex: number; isFinish: boolean }
  /** Anything in flight (voice, chimes, vibration) must stop now. */
  | { type: "hush" };

export interface EngineOptions {
  steps: readonly EngineStep[];
  countdownMs: number;
  leadMs?: number;
  speed?: number;
  now?: () => number;
}

/** A tick gap larger than this means the page was throttled or suspended. */
const STALE_GAP_MS = 1500;
/** Don't start a lead-in cue that would have less than this left to play. */
const MIN_LEAD_REMAINING_MS = 800;
/** A lead-in noticed within this many real milliseconds is on time. */
const FRESH_MS = 300;

export class BrewEngine {
  private steps: readonly EngineStep[];
  private countdownMs: number;
  private readonly leadMs: number;
  private speed: number;
  private readonly now: () => number;

  private _status: BrewStatus = "idle";
  private baseMs = 0;
  private anchorAt: number | null = null;
  private countdownEndsAt: number | null = null;
  private lastMs = 0;
  private lastTickAt = 0;

  private changeListeners = new Set<() => void>();
  private cueListeners = new Set<(cue: Cue) => void>();

  constructor(options: EngineOptions) {
    this.steps = options.steps;
    this.countdownMs = options.countdownMs;
    this.leadMs = options.leadMs ?? 5000;
    this.speed = Math.max(1, options.speed ?? 1);
    this.now = options.now ?? Date.now;
  }

  get status(): BrewStatus {
    return this._status;
  }

  get finalMs(): number {
    const last = this.steps[this.steps.length - 1];
    return last ? last.atSec * 1000 : 0;
  }

  get lead(): number {
    return this.leadMs;
  }

  elapsedMs(at: number = this.now()): number {
    if (this._status === "running" && this.anchorAt !== null) {
      return Math.min(this.finalMs, this.baseMs + (at - this.anchorAt) * this.speed);
    }
    return this.baseMs;
  }

  countdownRemainingMs(at: number = this.now()): number {
    if (this._status !== "countdown" || this.countdownEndsAt === null) return 0;
    return Math.max(0, this.countdownEndsAt - at);
  }

  get countdownTotalMs(): number {
    return this.countdownMs;
  }

  /** Replace steps or countdown while idle (e.g. the bean amount changed). */
  configure(options: Partial<Pick<EngineOptions, "steps" | "countdownMs">>): void {
    if (this._status !== "idle") return;
    if (options.steps) this.steps = options.steps;
    if (options.countdownMs !== undefined) this.countdownMs = options.countdownMs;
    this.emitChange();
  }

  setSpeed(speed: number): void {
    const next = Math.max(1, speed);
    if (next === this.speed) return;
    if (this._status === "running") {
      const at = this.now();
      this.baseMs = this.elapsedMs(at);
      this.anchorAt = at;
    }
    this.speed = next;
  }

  start(): void {
    if (this._status === "paused") {
      this.resume();
      return;
    }
    if (this._status !== "idle") return;
    const at = this.now();
    this.baseMs = 0;
    this.lastMs = 0;
    this.lastTickAt = at;

    if (this.countdownMs > 0) {
      this._status = "countdown";
      this.countdownEndsAt = at + this.countdownMs;
      this.emitChange();
      this.emitCue({ type: "countdown", offsetMs: 0 });
      return;
    }

    this.beginRunning(at);
  }

  resume(): void {
    if (this._status !== "paused") return;
    const at = this.now();
    this._status = "running";
    this.anchorAt = at;
    this.lastMs = this.baseMs;
    this.lastTickAt = at;
    this.emitChange();

    // If paused inside a lead-in, pick the cue up where the brew now is.
    const t = this.baseMs;
    const next = this.nextStepAfter(t);
    if (next && t >= next.step.atSec * 1000 - this.leadMs) {
      const cue = this.approachCue(next, t, false);
      if (cue) this.emitCue(cue);
    }
  }

  /** Move brew time without cues. For development tools and tests only. */
  seek(ms: number): void {
    if (this._status !== "running" && this._status !== "paused") return;
    const clamped = Math.max(0, Math.min(this.finalMs - 1, ms));
    this.baseMs = clamped;
    this.lastMs = clamped;
    if (this._status === "running") this.anchorAt = this.now();
    this.emitChange();
  }

  /** Pause a running brew, or cancel a countdown back to idle. */
  pause(): void {
    if (this._status === "countdown") {
      this._status = "idle";
      this.countdownEndsAt = null;
      this.baseMs = 0;
      this.emitCue({ type: "hush" });
      this.emitChange();
      return;
    }
    if (this._status !== "running") return;
    const at = this.now();
    this.baseMs = this.elapsedMs(at);
    this.anchorAt = null;
    this._status = "paused";
    this.emitCue({ type: "hush" });
    this.emitChange();
  }

  reset(): void {
    const wasActive = this._status !== "idle";
    this._status = "idle";
    this.baseMs = 0;
    this.lastMs = 0;
    this.anchorAt = null;
    this.countdownEndsAt = null;
    if (wasActive) {
      this.emitCue({ type: "hush" });
      this.emitChange();
    }
  }

  tick(): void {
    const at = this.now();
    const gap = at - this.lastTickAt;
    this.lastTickAt = at;
    const stale = gap > STALE_GAP_MS;

    if (this._status === "countdown") {
      if (this.countdownEndsAt === null || at < this.countdownEndsAt) return;
      // Anchor at the scheduled instant rather than "now" to stay precise.
      this.beginRunning(this.countdownEndsAt, stale);
    }
    if (this._status !== "running") return;

    const previous = this.lastMs;
    const t = this.elapsedMs(at);
    this.lastMs = t;
    if (t <= previous) return;

    let crossed = -1;
    this.steps.forEach((step, index) => {
      const ms = step.atSec * 1000;
      if (index > 0 && previous < ms && ms <= t) crossed = index;
    });

    const next = this.nextStepAfter(t);
    if (next) {
      const leadStart = next.step.atSec * 1000 - this.leadMs;
      if (previous < leadStart && leadStart <= t) {
        const cue = this.approachCue(next, t, !stale);
        if (cue) this.emitCue(cue);
      }
    }

    if (crossed >= 0) {
      this.emitCue({ type: "step", stepIndex: crossed, isFinish: this.steps[crossed].isFinish });
    }

    if (t >= this.finalMs) {
      this._status = "done";
      this.baseMs = this.finalMs;
      this.anchorAt = null;
      this.emitChange();
    }
  }

  subscribe(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  onCue(listener: (cue: Cue) => void): () => void {
    this.cueListeners.add(listener);
    return () => this.cueListeners.delete(listener);
  }

  private beginRunning(at: number, stale = false): void {
    this._status = "running";
    this.countdownEndsAt = null;
    this.baseMs = 0;
    this.lastMs = 0;
    this.anchorAt = at;
    this.emitChange();
    if (!stale) this.emitCue({ type: "step", stepIndex: 0, isFinish: false });
  }

  /**
   * The lead-in cue for `next` at brew time `t`, or null if too little of it
   * would be left to be useful. Brew time runs `speed` times faster than real
   * time, so the clip starts late enough to finish exactly on the step.
   */
  private approachCue(next: { step: EngineStep; index: number }, t: number, onTime: boolean): Cue | null {
    const realRemaining = (next.step.atSec * 1000 - t) / this.speed;
    if (realRemaining < MIN_LEAD_REMAINING_MS) return null;
    const offsetMs = Math.max(0, this.leadMs - realRemaining);
    return {
      type: "approach",
      stepIndex: next.index,
      isFinish: next.step.isFinish,
      offsetMs,
      fresh: onTime && this.leadMs - realRemaining * this.speed < FRESH_MS * this.speed,
    };
  }

  private nextStepAfter(t: number): { step: EngineStep; index: number } | null {
    for (let index = 0; index < this.steps.length; index += 1) {
      if (this.steps[index].atSec * 1000 > t) return { step: this.steps[index], index };
    }
    return null;
  }

  private emitChange(): void {
    this.changeListeners.forEach((listener) => listener());
  }

  private emitCue(cue: Cue): void {
    this.cueListeners.forEach((listener) => listener(cue));
  }
}

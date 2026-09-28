import { beforeEach, describe, expect, it } from "vitest";
import { BrewEngine, type Cue } from "./engine";

const STEPS = [
  { atSec: 0, isFinish: false },
  { atSec: 30, isFinish: false },
  { atSec: 45, isFinish: false },
  { atSec: 60, isFinish: true },
];

let now = 0;
let cues: Cue[] = [];

function make(countdownMs = 5000, speed = 1) {
  const engine = new BrewEngine({ steps: STEPS, countdownMs, speed, now: () => now });
  engine.onCue((cue) => cues.push(cue));
  return engine;
}

/** Advance the clock in ticks, as the 100 ms interval would. */
function run(engine: BrewEngine, ms: number, tick = 100) {
  const end = now + ms;
  while (now < end) {
    now = Math.min(end, now + tick);
    engine.tick();
  }
}

beforeEach(() => {
  now = 1_000_000;
  cues = [];
});

describe("starting", () => {
  it("counts down for five seconds, then starts at 0:00 exactly", () => {
    const engine = make();
    engine.start();
    expect(engine.status).toBe("countdown");
    expect(cues).toEqual([{ type: "countdown", offsetMs: 0 }]);
    expect(engine.countdownRemainingMs()).toBe(5000);

    run(engine, 4900);
    expect(engine.status).toBe("countdown");
    run(engine, 100);
    expect(engine.status).toBe("running");
    expect(engine.elapsedMs()).toBe(0);
    expect(cues.at(-1)).toEqual({ type: "step", stepIndex: 0, isFinish: false });
  });

  it("anchors the brew at the scheduled instant even if the tick is late", () => {
    const engine = make();
    engine.start();
    now += 5300;
    engine.tick();
    expect(engine.status).toBe("running");
    expect(engine.elapsedMs()).toBe(300);
  });

  it("starts immediately and silently without a countdown", () => {
    const engine = make(0);
    engine.start();
    expect(engine.status).toBe("running");
    expect(cues).toEqual([{ type: "step", stepIndex: 0, isFinish: false }]);
  });

  it("cancelling the countdown returns to idle and never starts later", () => {
    const engine = make();
    engine.start();
    run(engine, 2000);
    engine.pause();
    expect(engine.status).toBe("idle");
    expect(cues.at(-1)).toEqual({ type: "hush" });
    run(engine, 10_000);
    expect(engine.status).toBe("idle");
    expect(engine.elapsedMs()).toBe(0);

    engine.start();
    expect(engine.status).toBe("countdown");
  });
});

describe("guidance timing", () => {
  it("announces each step five seconds ahead and marks each crossing", () => {
    const engine = make(0);
    engine.start();
    cues = [];
    run(engine, 60_000);

    const approaches = cues.filter((c) => c.type === "approach");
    expect(approaches.map((c) => c.type === "approach" && c.stepIndex)).toEqual([1, 2, 3]);
    expect(approaches.every((c) => c.type === "approach" && c.offsetMs < 100)).toBe(true);
    expect(approaches.at(-1)).toMatchObject({ isFinish: true });

    const steps = cues.filter((c) => c.type === "step");
    expect(steps.map((c) => c.type === "step" && c.stepIndex)).toEqual([1, 2, 3]);
    expect(engine.status).toBe("done");
    expect(engine.elapsedMs()).toBe(60_000);
  });

  it("fires the lead-in when crossing 25 s, not before", () => {
    const engine = make(0);
    engine.start();
    cues = [];
    run(engine, 24_900);
    expect(cues).toEqual([]);
    run(engine, 100);
    expect(cues).toEqual([{ type: "approach", stepIndex: 1, isFinish: false, offsetMs: 0 }]);
  });

  it("scales timing and audio offsets under speed-up", () => {
    const engine = make(0, 5);
    engine.start();
    run(engine, 5_000);
    expect(engine.elapsedMs()).toBe(25_000);
    expect(cues.at(-1)).toMatchObject({ type: "approach", stepIndex: 1 });
  });
});

describe("pause and resume", () => {
  it("holds time while paused and stops cues", () => {
    const engine = make(0);
    engine.start();
    run(engine, 12_000);
    engine.pause();
    expect(engine.status).toBe("paused");
    expect(cues.at(-1)).toEqual({ type: "hush" });
    run(engine, 30_000);
    expect(engine.elapsedMs()).toBe(12_000);

    engine.resume();
    run(engine, 1000);
    expect(engine.elapsedMs()).toBe(13_000);
  });

  it("resuming inside a lead-in picks the countdown up mid-way", () => {
    const engine = make(0);
    engine.start();
    run(engine, 27_000);
    engine.pause();
    cues = [];
    now += 60_000;
    engine.resume();
    expect(cues).toEqual([{ type: "approach", stepIndex: 1, isFinish: false, offsetMs: 2000 }]);
  });

  it("does not replay a lead-in with too little left", () => {
    const engine = make(0);
    engine.start();
    run(engine, 29_500);
    engine.pause();
    cues = [];
    engine.resume();
    expect(cues).toEqual([]);
  });
});

describe("resilience", () => {
  it("catches up after the page was suspended without a burst of stale cues", () => {
    const engine = make(0);
    engine.start();
    cues = [];
    now += 40_000; // e.g. the phone slept
    engine.tick();
    expect(engine.elapsedMs()).toBe(40_000);
    // It lands mid-window of step 1: no lead-in for step 1 (already passed) and
    // no lead-in for step 2 yet (starts at 40 s: offset 0 is still fresh).
    expect(cues.filter((c) => c.type === "step")).toEqual([{ type: "step", stepIndex: 1, isFinish: false }]);
  });

  it("drops a lead-in that would be nearly over after a long gap", () => {
    const engine = make(0);
    engine.start();
    run(engine, 20_000);
    cues = [];
    now += 9_600;
    engine.tick();
    expect(cues.some((c) => c.type === "approach")).toBe(false);
  });

  it("ignores start while running or done, and resets cleanly", () => {
    const engine = make(0);
    engine.start();
    run(engine, 60_000);
    expect(engine.status).toBe("done");
    engine.start();
    expect(engine.status).toBe("done");
    engine.reset();
    expect(engine.status).toBe("idle");
    expect(engine.elapsedMs()).toBe(0);
  });

  it("notifies subscribers on every status change", () => {
    const engine = make();
    const seen: string[] = [];
    engine.subscribe(() => seen.push(engine.status));
    engine.start();
    run(engine, 5000);
    engine.pause();
    engine.resume();
    engine.reset();
    expect(seen).toEqual(["countdown", "running", "paused", "running", "idle"]);
  });

  it("seek moves time for development tools without cues", () => {
    const engine = make(0);
    engine.start();
    cues = [];
    engine.seek(44_000);
    expect(engine.elapsedMs()).toBe(44_000);
    expect(cues).toEqual([]);
    run(engine, 1000);
    expect(cues).toEqual([{ type: "step", stepIndex: 2, isFinish: false }]);
  });
});

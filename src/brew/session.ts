import { create } from "zustand";
import i18n from "../i18n/config";
import { Cues } from "../cues";
import { useBeans, useSettings, type Language } from "../settings/store";
import { play as playMusic } from "../music/player";
import { BrewEngine, type BrewStatus } from "./engine";
import { planBrew, type BrewPlan } from "./recipe";
import { describeBrew, fillLevel, windowProgress, type BrewView } from "./view";
import { createWakeLock, type WakeLockController } from "./wakeLock";

/**
 * The one brew in progress. It lives outside React so changing language or
 * re-rendering never disturbs the clock, and it drives sound, vibration and
 * the screen wake lock. React reads discrete values through `useBrew`;
 * continuous visuals (the dial, the rail) read `brew.progress()` per frame.
 */
const TICK_MS = 100;
const COUNTDOWN_MS = 5000;

interface BrewState {
  plan: BrewPlan;
  view: BrewView;
}

const initialPlan = planBrew(useBeans.getState().beans);
const toEngineSteps = (plan: BrewPlan) =>
  plan.steps.map((step) => ({ atSec: step.atSec, isFinish: step.kind === "finish" }));

const engine = new BrewEngine({
  steps: toEngineSteps(initialPlan),
  countdownMs: COUNTDOWN_MS,
  speed: useSettings.getState().speed,
});

export const useBrew = create<BrewState>(() => ({
  plan: initialPlan,
  view: describeBrew(initialPlan, "idle", 0, 0),
}));

const language = (): Language => (i18n.resolvedLanguage === "ja" ? "ja" : "en");
export const cues = new Cues(language);
// Voice clips are per language; have the new ones ready before the next brew.
i18n.on("languageChanged", () => void cues.warm());

let wakeLock: WakeLockController | null = null;
const getWakeLock = () => {
  if (!wakeLock && typeof document !== "undefined") wakeLock = createWakeLock();
  return wakeLock;
};

let ticker: ReturnType<typeof setInterval> | null = null;

function sameView(a: BrewView, b: BrewView): boolean {
  return a.status === b.status
    && a.current === b.current
    && a.next === b.next
    && a.secondsToNext === b.secondsToNext
    && a.countdownSeconds === b.countdownSeconds
    && a.approaching === b.approaching
    && a.draining === b.draining
    && a.elapsedSeconds === b.elapsedSeconds;
}

function sync() {
  const now = Date.now();
  const { plan, view } = useBrew.getState();
  const next = describeBrew(plan, engine.status, engine.elapsedMs(now), engine.countdownRemainingMs(now));
  if (!sameView(view, next)) useBrew.setState({ view: next });
}

function onStatus() {
  const status = engine.status;
  const active = status === "countdown" || status === "running";
  if (active && !ticker) {
    ticker = setInterval(() => {
      engine.tick();
      sync();
    }, TICK_MS);
  } else if (!active && ticker) {
    clearInterval(ticker);
    ticker = null;
  }
  if (active) void getWakeLock()?.request();
  else getWakeLock()?.release();
  sync();
}

engine.subscribe(onStatus);
engine.onCue((cue) => cues.handle(cue));

if (typeof document !== "undefined") {
  // Catch up at once when returning to the page rather than on the next tick.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      engine.tick();
      sync();
    }
  });
}

useSettings.subscribe((state, previous) => {
  if (state.speed !== previous.speed) engine.setSpeed(state.speed);
  if (state.sound !== previous.sound || state.voice !== previous.voice) {
    if (state.sound === "off") cues.stop();
    void cues.warm();
  }
});

if (import.meta.env.DEV && typeof window !== "undefined") {
  // Development handle: e.g. __neo.seek(145) to inspect a moment.
  (window as unknown as Record<string, unknown>).__neo = {
    engine,
    seek: (seconds: number) => {
      engine.seek(seconds * 1000);
      sync();
    },
  };
}

export const brew = {
  get status(): BrewStatus {
    return engine.status;
  },

  /** Use this bean amount for the next brew. Ignored while a brew is active. */
  prepare(beans: number): void {
    if (engine.status !== "idle") return;
    const { plan } = useBrew.getState();
    if (plan.beans !== beans) {
      const next = planBrew(beans);
      engine.configure({ steps: toEngineSteps(next) });
      useBrew.setState({ plan: next, view: describeBrew(next, "idle", 0, 0) });
    }
    void cues.warm();
  },

  /** Call from the tap that starts the brew: unlocks audio in the gesture. */
  start(): void {
    if (engine.status === "done") engine.reset();
    const settings = useSettings.getState();
    cues.unlock();
    if (settings.music) void playMusic();
    engine.configure({ countdownMs: settings.countdown ? COUNTDOWN_MS : 0 });
    engine.setSpeed(settings.speed);
    engine.start();
  },

  pause(): void {
    engine.pause();
  },

  resume(): void {
    cues.unlock();
    engine.resume();
  },

  reset(): void {
    engine.reset();
  },

  elapsedMs(): number {
    return engine.elapsedMs();
  },

  /** 0→1 through the current window (or the lead-in countdown). */
  progress(): number {
    const { plan } = useBrew.getState();
    return windowProgress(plan, engine.status, engine.elapsedMs(), engine.countdownRemainingMs(), engine.countdownTotalMs);
  },

  /** 0→1 through the whole brew. */
  overall(): number {
    const { plan } = useBrew.getState();
    return plan.durationSec > 0 ? engine.elapsedMs() / (plan.durationSec * 1000) : 0;
  },

  /** How full the cup is: current target over total water. */
  level(): number {
    const { plan } = useBrew.getState();
    return fillLevel(plan, engine.status, engine.elapsedMs());
  },
};

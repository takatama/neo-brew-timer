import type { BrewPlan, BrewStep } from "./recipe";
import type { BrewStatus } from "./engine";

export const LEAD_SECONDS = 5;

/** Everything the brewing screen shows, derived from one moment in time. */
export interface BrewView {
  status: BrewStatus;
  /** The step whose target the scale should reach now (the first pour before starting). */
  current: BrewStep;
  /** What comes after `current`; the finish step after the last pour. */
  next: BrewStep | null;
  /** Whole seconds until `next` begins (brew time). */
  secondsToNext: number;
  /** Whole seconds left in the lead-in countdown (5…1), or 0. */
  countdownSeconds: number;
  /** Inside the five seconds before the next step (or the lead-in). */
  approaching: boolean;
  /** Whole seconds of brew time elapsed. */
  elapsedSeconds: number;
  /** Seconds in the current window; used to size the dial's ticks. */
  windowSeconds: number;
  /**
   * After the last pour has had as long as any other pour, nothing is left
   * to do but let it drain; the scale target is unchanged.
   */
  draining: boolean;
}

export function currentStepIndex(plan: BrewPlan, elapsedMs: number): number {
  const t = elapsedMs / 1000;
  for (let index = plan.steps.length - 1; index >= 0; index -= 1) {
    if (t >= plan.steps[index].atSec) return index;
  }
  return 0;
}

export function describeBrew(
  plan: BrewPlan,
  status: BrewStatus,
  elapsedMs: number,
  countdownRemainingMs: number,
): BrewView {
  const first = plan.steps[0];
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  if (status === "idle" || status === "countdown") {
    const countdownSeconds = status === "countdown"
      ? Math.max(1, Math.ceil(countdownRemainingMs / 1000))
      : 0;
    return {
      status,
      current: first,
      next: first,
      secondsToNext: first.untilSec - first.atSec,
      countdownSeconds,
      approaching: status === "countdown",
      elapsedSeconds: 0,
      windowSeconds: first.untilSec - first.atSec,
      draining: false,
    };
  }

  const index = Math.min(currentStepIndex(plan, elapsedMs), plan.steps.length - 1);
  const finished = status === "done" || plan.steps[index].kind === "finish";
  const current = finished
    ? plan.steps[plan.steps.length - 1]
    : plan.steps[index];
  const next = finished ? null : plan.steps[index + 1] ?? null;
  const remainingMs = next ? Math.max(0, next.atSec * 1000 - elapsedMs) : 0;
  const secondsToNext = Math.ceil(remainingMs / 1000);
  const previous = plan.steps[current.index - 1];
  const pourSpan = previous ? current.atSec - previous.atSec : current.untilSec - current.atSec;
  const draining = !finished && current.isLastPour && elapsedMs >= (current.atSec + pourSpan) * 1000;

  return {
    status: finished ? "done" : status,
    current,
    next,
    secondsToNext,
    countdownSeconds: 0,
    approaching: status === "running" && next !== null && remainingMs > 0 && remainingMs <= LEAD_SECONDS * 1000,
    elapsedSeconds: Math.min(elapsedSeconds, plan.durationSec),
    windowSeconds: Math.max(1, current.untilSec - current.atSec),
    draining,
  };
}

/** Fraction of the current window that has elapsed, for continuous visuals. */
export function windowProgress(plan: BrewPlan, status: BrewStatus, elapsedMs: number, countdownRemainingMs: number, countdownTotalMs: number): number {
  if (status === "countdown") {
    return countdownTotalMs > 0 ? 1 - countdownRemainingMs / countdownTotalMs : 1;
  }
  if (status === "idle") return 0;
  if (status === "done") return 1;
  const step = plan.steps[currentStepIndex(plan, elapsedMs)];
  const span = (step.untilSec - step.atSec) * 1000;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (elapsedMs - step.atSec * 1000) / span));
}

/** How full the cup should look: the current target over the total water. */
export function fillLevel(plan: BrewPlan, status: BrewStatus, elapsedMs: number): number {
  if (status === "idle" || status === "countdown") return 0;
  if (status === "done") return 1;
  const step = plan.steps[currentStepIndex(plan, elapsedMs)];
  return plan.water > 0 ? step.target / plan.water : 0;
}

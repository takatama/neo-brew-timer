/**
 * Tetsu Kasuya's Neo Brew: ten pours at 1:15, bloom at 0:00, then a pour
 * every 15 seconds from 0:30 through 2:30, and an estimated finish at 3:30.
 *
 * Targets are cumulative scale readings. Rounding is applied to the running
 * total (never to a repeated increment) so pours differ by at most 1 g and
 * always sum to the intended water.
 */
export interface Recipe {
  id: string;
  ratio: number;
  /** Seconds at which each pour begins. The first pour is the bloom. */
  pours: readonly number[];
  finishSec: number;
}

export const NEO_BREW: Recipe = {
  id: "neo-brew",
  ratio: 15,
  pours: [0, 30, 45, 60, 75, 90, 105, 120, 135, 150],
  finishSec: 210,
};

export const MIN_BEANS = 1;
export const MAX_BEANS = 100;
export const DEFAULT_BEANS = 20;

export type StepKind = "bloom" | "pour" | "finish";

export interface BrewStep {
  index: number;
  kind: StepKind;
  /** Brew time when this step begins. */
  atSec: number;
  /** Brew time when the following step begins (equal to atSec for finish). */
  untilSec: number;
  /** What the scale should read once this pour is done. */
  target: number;
  /** Grams added by this step. */
  amount: number;
  /** 1-based pour number; 0 for the finish step. */
  pour: number;
  isLastPour: boolean;
}

export interface BrewPlan {
  beans: number;
  water: number;
  pourCount: number;
  durationSec: number;
  steps: BrewStep[];
}

export function clampBeans(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BEANS;
  return Math.min(MAX_BEANS, Math.max(MIN_BEANS, Math.round(value)));
}

export function waterFor(beans: number, recipe: Recipe = NEO_BREW): number {
  return Math.round(beans * recipe.ratio);
}

export function planBrew(beans: number, recipe: Recipe = NEO_BREW): BrewPlan {
  const water = waterFor(beans, recipe);
  const count = recipe.pours.length;
  const steps: BrewStep[] = [];
  let previous = 0;

  recipe.pours.forEach((atSec, i) => {
    const target = Math.round((water * (i + 1)) / count);
    steps.push({
      index: i,
      kind: i === 0 ? "bloom" : "pour",
      atSec,
      untilSec: recipe.pours[i + 1] ?? recipe.finishSec,
      target,
      amount: target - previous,
      pour: i + 1,
      isLastPour: i === count - 1,
    });
    previous = target;
  });

  steps.push({
    index: count,
    kind: "finish",
    atSec: recipe.finishSec,
    untilSec: recipe.finishSec,
    target: water,
    amount: 0,
    pour: 0,
    isLastPour: false,
  });

  return { beans, water, pourCount: count, durationSec: recipe.finishSec, steps };
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

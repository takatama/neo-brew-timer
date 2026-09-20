import type { ComputedStep, Recipe } from "./types";
export {
  formatTimerTime as formatTime,
  getCurrentStepIndex,
} from "../../shared/brew-timer";

export function getTotalWater(beans: number, waterRatio: number): number {
  return Math.round(beans * waterRatio);
}

export function computeSteps(
  recipe: Recipe,
  beans: number,
): ComputedStep[] {
  const total = getTotalWater(beans, recipe.waterRatio);
  const equalPourCount = recipe.steps.filter((step) => step.waterAmountType === "equalPour").length;
  let cumulative = 0;
  let equalPourIndex = 0;

  return recipe.steps.map((step) => {
    let increment: number;
    switch (step.waterAmountType) {
      case "equalPour":
        equalPourIndex += 1;
        increment = Math.round(total * equalPourIndex / equalPourCount) - cumulative;
        break;
      case "none":
        increment = 0;
        break;
      default: {
        const _exhaustive: never = step.waterAmountType;
        throw new Error(`Unknown waterAmountType: ${_exhaustive}`);
      }
    }
    cumulative += increment;
    return { ...step, cumulative, increment };
  });
}

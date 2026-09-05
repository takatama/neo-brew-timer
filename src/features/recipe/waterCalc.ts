import type { ComputedStep, FlavorProfile, Recipe } from "./types";
export {
  formatTimerTime as formatTime,
  getCurrentStepIndex,
} from "../../shared/brew-timer";

export function getTotalWater(beans: number, waterRatio: number): number {
  return Math.round(beans * waterRatio);
}

export function calcFlavor1(total: number, flavor: FlavorProfile): number {
  const factor = flavor === "sweet" ? 0.42 : flavor === "sour" ? 0.58 : 0.5;
  return Math.round(total * 0.4 * factor);
}

export function calcFlavor2(total: number, flavor: FlavorProfile): number {
  const factor = flavor === "sweet" ? 0.58 : flavor === "sour" ? 0.42 : 0.5;
  return Math.round(total * 0.4 * factor);
}

export function calcStrength(total: number): number {
  return Math.round((total * 0.6) / 2);
}

export function calcEqualPour(total: number, pourCount: number): number {
  return Math.round(total / pourCount);
}

export function computeSteps(
  recipe: Recipe,
  beans: number,
  flavor: FlavorProfile,
): ComputedStep[] {
  const total = getTotalWater(beans, recipe.waterRatio);
  const equalPourCount = recipe.steps.filter((step) => step.waterAmountType === "equalPour").length;
  let cumulative = 0;
  let equalPourIndex = 0;

  return recipe.steps.map((step) => {
    let increment: number;
    switch (step.waterAmountType) {
      case "flavor1":
        increment = calcFlavor1(total, flavor);
        break;
      case "flavor2":
        increment = calcFlavor2(total, flavor);
        break;
      case "strength":
        increment = calcStrength(total);
        break;
      case "equalPour":
        equalPourIndex += 1;
        increment = equalPourIndex === equalPourCount
          ? total - cumulative
          : calcEqualPour(total, equalPourCount);
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


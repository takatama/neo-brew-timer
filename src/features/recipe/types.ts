export type FlavorProfile = "sweet" | "neutral" | "sour";

export type ActionType =
  | "switch_close_pour"
  | "switch_open_pour"
  | "pour"
  | "pour_cool"
  | "switch_open"
  | "none";

export type WaterAmountType = "flavor1" | "flavor2" | "strength" | "equalPour" | "none";

export interface RecipeStep {
  timeSec: number;
  actionType: ActionType;
  waterAmountType: WaterAmountType;
}

export interface Recipe {
  id: string;
  waterRatio: number;
  waterTemp: number;
  steps: RecipeStep[];
}

export interface ComputedStep extends RecipeStep {
  cumulative: number;
  increment: number;
}

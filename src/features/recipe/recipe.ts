import type { Recipe } from "./types";

export const neoBrewMethod: Recipe = {
  id: "neo-brew",
  waterRatio: 15,
  waterTemp: 96,
  steps: [
    { timeSec: 0, actionType: "bloom", waterAmountType: "equalPour" },
    { timeSec: 30, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 45, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 60, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 75, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 90, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 105, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 120, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 135, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 150, actionType: "pour", waterAmountType: "equalPour" },
    { timeSec: 165, actionType: "drawdown", waterAmountType: "none" },
    { timeSec: 210, actionType: "none", waterAmountType: "none" },
  ],
};

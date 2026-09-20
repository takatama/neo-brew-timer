import { describe, it, expect } from "vitest";
import {
  getTotalWater,
  computeSteps,
  getCurrentStepIndex,
  formatTime,
} from "./waterCalc";
import { neoBrewMethod } from "./recipe";

describe("getTotalWater", () => {
  it("calculates total water with 15:1 ratio", () => {
    expect(getTotalWater(20, 15)).toBe(300);
  });

  it("rounds to nearest integer", () => {
    expect(getTotalWater(13, 15)).toBe(195);
  });

  it("handles 1g beans", () => {
    expect(getTotalWater(1, 15)).toBe(15);
  });
});

describe("computeSteps", () => {
  it("produces 10 pours and one finish step for Neo Brew", () => {
    const steps = computeSteps(neoBrewMethod, 20);
    expect(steps).toHaveLength(11);
  });

  it("20g: final cumulative is 300g", () => {
    const steps = computeSteps(neoBrewMethod, 20);
    expect(steps[steps.length - 1].cumulative).toBe(300);
  });

  it("20g: step water amounts are correct", () => {
    const steps = computeSteps(neoBrewMethod, 20);
    expect(steps.slice(0, 10).map((s) => s.increment)).toEqual([
      30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    ]);
    expect(steps.map((s) => s.cumulative)).toEqual([
      30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 300,
    ]);
  });

  it("preserves step timing", () => {
    const steps = computeSteps(neoBrewMethod, 20);
    expect(steps.map((s) => s.timeSec)).toEqual([0, 30, 45, 60, 75, 90, 105, 120, 135, 150, 210]);
  });

  it("preserves action types", () => {
    const steps = computeSteps(neoBrewMethod, 20);
    expect(steps.map((s) => s.actionType)).toEqual([
      "bloom",
      "pour",
      "pour",
      "pour",
      "pour",
      "pour",
      "pour",
      "pour",
      "pour",
      "pour",
      "none",
    ]);
  });

  it("handles different bean amounts", () => {
    const steps10 = computeSteps(neoBrewMethod, 10);
    const steps30 = computeSteps(neoBrewMethod, 30);
    expect(steps10[steps10.length - 1].cumulative).toBe(150);
    expect(steps30[steps30.length - 1].cumulative).toBe(450);
  });
});

describe("getCurrentStepIndex", () => {
  const steps = computeSteps(neoBrewMethod, 20);

  it("returns 0 at time 0", () => {
    expect(getCurrentStepIndex(steps, 0)).toBe(0);
  });

  it("returns 0 just before step 2", () => {
    expect(getCurrentStepIndex(steps, 29.9)).toBe(0);
  });

  it("returns 1 at time 30", () => {
    expect(getCurrentStepIndex(steps, 30)).toBe(1);
  });

  it("returns last step at final time", () => {
    expect(getCurrentStepIndex(steps, 210)).toBe(10);
  });

  it("returns last step beyond final time", () => {
    expect(getCurrentStepIndex(steps, 999)).toBe(10);
  });
});

describe("formatTime", () => {
  it("formats 0 seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("formats 90 seconds as 1:30", () => {
    expect(formatTime(90)).toBe("1:30");
  });

  it("formats 210 seconds as 3:30", () => {
    expect(formatTime(210)).toBe("3:30");
  });

  it("formats 5 seconds as 0:05", () => {
    expect(formatTime(5)).toBe("0:05");
  });

  it("truncates fractional seconds", () => {
    expect(formatTime(90.7)).toBe("1:30");
  });
});


describe("rounding across all supported bean amounts", () => {
  it("keeps pours positive, balanced, and equal to the total", () => {
    for (let beans = 1; beans <= 100; beans++) {
      const pours = computeSteps(neoBrewMethod, beans).slice(0, 10);
      const amounts = pours.map(step => step.increment);
      expect(Math.min(...amounts)).toBeGreaterThan(0);
      expect(Math.max(...amounts) - Math.min(...amounts)).toBeLessThanOrEqual(1);
      expect(amounts.reduce((sum, n) => sum + n, 0)).toBe(beans * 15);
      expect(pours[9].cumulative).toBe(beans * 15);
    }
  });
});

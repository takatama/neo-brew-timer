import { describe, expect, it } from "vitest";
import { NEO_BREW, clampBeans, formatClock, planBrew, waterFor } from "./recipe";

describe("Neo Brew plan", () => {
  it("keeps the established schedule: bloom at 0:00, then every 15 s from 0:30, done at 3:30", () => {
    const plan = planBrew(20);
    expect(plan.steps.map((s) => s.atSec)).toEqual([0, 30, 45, 60, 75, 90, 105, 120, 135, 150, 210]);
    expect(plan.steps.map((s) => s.kind)).toEqual([
      "bloom", "pour", "pour", "pour", "pour", "pour", "pour", "pour", "pour", "pour", "finish",
    ]);
    expect(plan.durationSec).toBe(210);
    expect(plan.pourCount).toBe(10);
  });

  it("gives cumulative scale targets, never per-pour amounts", () => {
    const plan = planBrew(20);
    expect(plan.water).toBe(300);
    expect(plan.steps.map((s) => s.target)).toEqual([30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 300]);
    expect(plan.steps.slice(0, 10).every((s) => s.amount === 30)).toBe(true);
  });

  it("links each window to the step that follows it", () => {
    const plan = planBrew(20);
    expect(plan.steps[0].untilSec).toBe(30);
    expect(plan.steps[1].untilSec).toBe(45);
    expect(plan.steps[9].untilSec).toBe(210);
    expect(plan.steps[9].isLastPour).toBe(true);
    expect(plan.steps.filter((s) => s.isLastPour)).toHaveLength(1);
  });

  it("rounds the running total so pours stay positive, within 1 g, and sum to the water", () => {
    for (let beans = 1; beans <= 100; beans += 1) {
      const pours = planBrew(beans).steps.filter((s) => s.kind !== "finish");
      const amounts = pours.map((s) => s.amount);
      expect(Math.min(...amounts)).toBeGreaterThan(0);
      expect(Math.max(...amounts) - Math.min(...amounts)).toBeLessThanOrEqual(1);
      expect(amounts.reduce((sum, n) => sum + n, 0)).toBe(beans * NEO_BREW.ratio);
      expect(pours[9].target).toBe(beans * NEO_BREW.ratio);
      pours.forEach((step, i) => {
        if (i > 0) expect(step.target).toBeGreaterThan(pours[i - 1].target);
      });
    }
  });

  it("handles odd totals like 21 g → 315 g", () => {
    const targets = planBrew(21).steps.slice(0, 10).map((s) => s.target);
    expect(targets).toEqual([32, 63, 95, 126, 158, 189, 221, 252, 284, 315]);
  });
});

describe("helpers", () => {
  it("clamps bean amounts to whole grams from 1 to 100", () => {
    expect(clampBeans(0)).toBe(1);
    expect(clampBeans(101)).toBe(100);
    expect(clampBeans(18.6)).toBe(19);
    expect(clampBeans(Number.NaN)).toBe(20);
  });

  it("computes water at 1:15", () => {
    expect(waterFor(13)).toBe(195);
  });

  it("formats clocks", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(5)).toBe("0:05");
    expect(formatClock(90.9)).toBe("1:30");
    expect(formatClock(210)).toBe("3:30");
    expect(formatClock(-3)).toBe("0:00");
  });
});

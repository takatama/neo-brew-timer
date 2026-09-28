import { describe, expect, it } from "vitest";
import { planBrew } from "./recipe";
import { describeBrew, fillLevel, windowProgress } from "./view";

const plan = planBrew(20);

describe("before brewing", () => {
  it("previews the bloom while idle", () => {
    const view = describeBrew(plan, "idle", 0, 0);
    expect(view.current.kind).toBe("bloom");
    expect(view.current.target).toBe(30);
    expect(view.countdownSeconds).toBe(0);
    expect(view.approaching).toBe(false);
  });

  it("counts 5 → 1 during the lead-in, never 0", () => {
    expect(describeBrew(plan, "countdown", 0, 5000).countdownSeconds).toBe(5);
    expect(describeBrew(plan, "countdown", 0, 4001).countdownSeconds).toBe(5);
    expect(describeBrew(plan, "countdown", 0, 4000).countdownSeconds).toBe(4);
    expect(describeBrew(plan, "countdown", 0, 1).countdownSeconds).toBe(1);
    expect(describeBrew(plan, "countdown", 0, 0).countdownSeconds).toBe(1);
    expect(describeBrew(plan, "countdown", 0, 3000).elapsedSeconds).toBe(0);
  });
});

describe("while brewing", () => {
  it("switches straight from the countdown to the first target", () => {
    const view = describeBrew(plan, "running", 0, 0);
    expect(view.current.target).toBe(30);
    expect(view.next?.target).toBe(60);
    expect(view.secondsToNext).toBe(30);
  });

  it("changes target exactly on the step boundary", () => {
    expect(describeBrew(plan, "running", 29_999, 0).current.target).toBe(30);
    expect(describeBrew(plan, "running", 30_000, 0).current.target).toBe(60);
    expect(describeBrew(plan, "running", 30_000, 0).next?.target).toBe(90);
  });

  it("flags the five seconds before each step", () => {
    expect(describeBrew(plan, "running", 24_999, 0).approaching).toBe(false);
    expect(describeBrew(plan, "running", 25_000, 0).approaching).toBe(true);
    expect(describeBrew(plan, "running", 29_900, 0).approaching).toBe(true);
    expect(describeBrew(plan, "running", 30_000, 0).approaching).toBe(false);
    expect(describeBrew(plan, "paused", 27_000, 0).approaching).toBe(false);
  });

  it("rounds the seconds to the next step up", () => {
    expect(describeBrew(plan, "running", 18_200, 0).secondsToNext).toBe(12);
    expect(describeBrew(plan, "running", 29_001, 0).secondsToNext).toBe(1);
  });

  it("sizes the dial's ticks to the current window", () => {
    expect(describeBrew(plan, "running", 1000, 0).windowSeconds).toBe(30);
    expect(describeBrew(plan, "running", 31_000, 0).windowSeconds).toBe(15);
    expect(describeBrew(plan, "running", 151_000, 0).windowSeconds).toBe(60);
  });

  it("points the last pour at the finish, then lets it drain", () => {
    const pouring = describeBrew(plan, "running", 152_000, 0);
    expect(pouring.current.isLastPour).toBe(true);
    expect(pouring.next?.kind).toBe("finish");
    expect(pouring.draining).toBe(false);

    const draining = describeBrew(plan, "running", 165_000, 0);
    expect(draining.draining).toBe(true);
    expect(draining.current.target).toBe(300);
    expect(draining.secondsToNext).toBe(45);
  });
});

describe("finished", () => {
  it("reports done at 3:30", () => {
    const view = describeBrew(plan, "done", 210_000, 0);
    expect(view.status).toBe("done");
    expect(view.next).toBeNull();
    expect(view.elapsedSeconds).toBe(210);
  });
});

describe("continuous visuals", () => {
  it("tracks progress through the window and the lead-in", () => {
    expect(windowProgress(plan, "countdown", 0, 5000, 5000)).toBe(0);
    expect(windowProgress(plan, "countdown", 0, 2500, 5000)).toBe(0.5);
    expect(windowProgress(plan, "running", 15_000, 0, 5000)).toBe(0.5);
    expect(windowProgress(plan, "running", 37_500, 0, 5000)).toBe(0.5);
    expect(windowProgress(plan, "idle", 0, 0, 5000)).toBe(0);
    expect(windowProgress(plan, "done", 210_000, 0, 5000)).toBe(1);
  });

  it("fills the cup to the current target's share of the water", () => {
    expect(fillLevel(plan, "idle", 0)).toBe(0);
    expect(fillLevel(plan, "running", 0)).toBe(0.1);
    expect(fillLevel(plan, "running", 76_000)).toBe(0.5);
    expect(fillLevel(plan, "done", 210_000)).toBe(1);
  });
});

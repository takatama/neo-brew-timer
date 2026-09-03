import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ComputedStep } from "../../recipe/types";
import { Timeline } from "./Timeline";

const steps: ComputedStep[] = [0, 15, 45, 60].map((timeSec) => ({
  timeSec,
  actionType: "pour",
  waterAmountType: "equalPour",
  cumulative: 0,
  increment: 0,
}));

describe("Timeline", () => {
  it("positions step nodes and elapsed time in proportion to the total duration", () => {
    const { container } = render(
      <Timeline steps={steps} currentStepIndex={1} currentTime={30} />,
    );
    const positionedMarkers = [...container.querySelectorAll<HTMLElement>("[style*='left']")];

    expect(positionedMarkers.map((marker) => marker.style.left)).toEqual([
      "50%",
      "0%",
      "25%",
      "75%",
      "100%",
    ]);
    expect(container.querySelector("[class*='currentStep']")).toHaveStyle({ left: "25%" });
    expect(container.querySelectorAll("[class*='passedStep']")).toHaveLength(1);
  });
});

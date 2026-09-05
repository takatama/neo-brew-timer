import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimerTimeline } from "./TimerTimeline";

const steps = [0, 15, 45, 60].map((timeSec) => ({ timeSec }));

describe("TimerTimeline", () => {
  it("positions steps and elapsed time in proportion to the total duration", () => {
    const { container } = render(
      <TimerTimeline
        steps={steps}
        currentStepIndex={1}
        currentTime={30}
        ariaLabel="Timeline"
      />,
    );
    const positionedMarkers = [
      ...container.querySelectorAll<HTMLElement>("[style*='left']"),
    ];

    expect(positionedMarkers.map((marker) => marker.style.left)).toEqual([
      "50%",
      "0%",
      "25%",
      "75%",
      "100%",
    ]);
    expect(container.querySelector("[class*='currentStep']")).toHaveStyle({
      left: "25%",
    });
    expect(container.querySelectorAll("[class*='passedStep']")).toHaveLength(1);
  });
});

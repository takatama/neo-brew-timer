import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ComputedStep } from "../../recipe/types";
import "../../../shared/i18n/config";
import { NextStepPreview } from "./NextStepPreview";
import { StepCard } from "./StepCard";

vi.mock("../../../shared/components/LottiePlayer", () => ({
  buildLottieQueue: () => ["pour"],
  LottiePlayer: () => <div data-testid="lottie-player" />,
}));

const firstStep: ComputedStep = {
  timeSec: 0,
  actionType: "bloom",
  waterAmountType: "equalPour",
  cumulative: 30,
  increment: 30,
};

describe("timer cards", () => {
  it("uses the first-step heading for the startup animation", () => {
    render(
      <NextStepPreview
        step={firstStep}
        prevCumulative={0}
        visible
        isFirstStep
      />,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("hides the step-one target while its animation is visible", () => {
    const { container, rerender } = render(
      <StepCard
        step={firstStep}
        stepIndex={0}
        totalSteps={1}
        remainingSeconds={30}
        progress={0}
        isImminent={false}
        nextStepPreview={<div>animation</div>}
        steps={[firstStep]}
        currentTime={0}
      />,
    );

    expect(container).not.toHaveTextContent("30g");

    rerender(
      <StepCard
        step={firstStep}
        stepIndex={0}
        totalSteps={1}
        remainingSeconds={30}
        progress={0}
        isImminent={false}
        steps={[firstStep]}
        currentTime={0}
      />,
    );

    expect(container).toHaveTextContent("30g");
  });
});

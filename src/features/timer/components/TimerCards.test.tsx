import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ComputedStep } from "../../recipe/types";
import i18n from "../../../shared/i18n/config";
import { Countdown } from "./Countdown";
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
  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("shows the English remaining-time label after the countdown", async () => {
    await i18n.changeLanguage("en");
    const { container } = render(
      <Countdown remainingSeconds={30} progress={0} isImminent={false} />,
    );

    expect(container.firstElementChild).toHaveTextContent(/^0:30 left$/);
  });

  it("shows the Japanese remaining-time label before the countdown", async () => {
    await i18n.changeLanguage("ja");
    const { container } = render(
      <Countdown remainingSeconds={4} progress={0} isImminent={false} />,
    );

    expect(container.firstElementChild).toHaveTextContent(/^あと 0:04$/);
  });

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

  it("preserves the hidden initial target's layout until the timer starts", () => {
    const { container, rerender } = render(
      <StepCard
        step={firstStep}
        stepIndex={0}
        totalSteps={1}
        remainingSeconds={30}
        progress={0}
        isImminent={false}
        hideTargetAmount
        nextStepPreview={<div>animation</div>}
        steps={[firstStep]}
        currentTime={0}
      />,
    );

    const target = container.querySelector<HTMLElement>("[class*='stepSub']");
    expect(target).toHaveTextContent("30g");
    expect(target).toHaveAttribute("aria-hidden", "true");
    expect(target?.className).toContain("stepSubHidden");

    rerender(
      <StepCard
        step={firstStep}
        stepIndex={0}
        totalSteps={1}
        remainingSeconds={30}
        progress={0}
        isImminent={false}
        nextStepPreview={<div>next animation</div>}
        steps={[firstStep]}
        currentTime={0}
      />,
    );

    expect(container).toHaveTextContent("30g");
    expect(target).not.toHaveAttribute("aria-hidden");
    expect(target?.className).not.toContain("stepSubHidden");
  });
});

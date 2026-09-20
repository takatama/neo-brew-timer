import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ComputedStep } from "../../recipe/types";
import i18n from "../../../shared/i18n/config";
import { Countdown } from "./Countdown";
import { NextStepPreview } from "./NextStepPreview";
import { StepCard } from "./StepCard";

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


  it("shows the actual next target immediately, without counting up from zero", () => {
    render(<NextStepPreview step={firstStep} />);
    expect(screen.getByText("30g")).toBeInTheDocument();
    expect(screen.queryByText("0g")).not.toBeInTheDocument();
  });

  it("shows only the start countdown centrally and the first target in Next while starting", () => {
    const props = { step: firstStep, stepIndex: 0, totalSteps: 10, remainingSeconds: 30,
      progress: 0, isImminent: false, steps: [firstStep], currentTime: 0,
      nextStepPreview: <NextStepPreview step={firstStep} /> };
    const { rerender } = render(<StepCard {...props} status="idle" startupSeconds={5} />);
    expect(screen.getByRole("heading", { name: "Starting in" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Waiting to start");
    expect(screen.getByLabelText("Starting in 5s")).toHaveTextContent("5sec");
    expect(screen.getByText("30g")).toBeVisible();
    expect(screen.getByText("Next pour in").parentElement).toHaveAttribute("aria-hidden", "true");
    rerender(<StepCard {...props} status="running" startupSeconds={null} />);
    expect(screen.getByRole("heading", { name: "Bloom" })).toBeVisible();
    expect(screen.getByText("30")).toBeVisible();
    rerender(<StepCard {...props} status="paused" startupSeconds={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("Paused");
  });

  it("renders the selected decorative preview without exposing it to assistive technology", () => {
    render(<NextStepPreview step={firstStep} animationMode="handdrawn" animationProgress={0.5} />);
    const animation = screen.getByTestId("pour-animation-handdrawn");
    expect(animation).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("30g")).toBeVisible();
  });
});

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

  it("keeps the first target visible while clearly separating preparation and brewing", () => {
    const props = { step: firstStep, stepIndex: 0, totalSteps: 10, remainingSeconds: 30,
      progress: 0, isImminent: false, steps: [firstStep], currentTime: 0 };
    const { rerender } = render(<StepCard {...props} status="idle" startupSeconds={5} />);
    expect(screen.getByRole("heading", { name: "First pour" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Starting in 5s");
    expect(screen.getByText("30")).toBeVisible();
    rerender(<StepCard {...props} status="running" startupSeconds={null} />);
    expect(screen.getByRole("heading", { name: "Bloom" })).toBeVisible();
    expect(screen.getByText("30")).toBeVisible();
    rerender(<StepCard {...props} status="paused" startupSeconds={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("Paused");
  });
});

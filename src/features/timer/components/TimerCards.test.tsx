import { act, render, screen } from "@testing-library/react";
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
    await act(() => i18n.changeLanguage("en"));
  });

  it("shows the English remaining-time label after the countdown", async () => {
    await i18n.changeLanguage("en");
    const { container } = render(
      <Countdown remainingSeconds={30} progress={0} isImminent={false} />,
    );

    expect(container.firstElementChild).toHaveTextContent(/^0:30 left$/);
  });

  it("shows the Japanese remaining-time label before the countdown", async () => {
    await act(() => i18n.changeLanguage("ja"));
    const { container } = render(
      <Countdown remainingSeconds={4} progress={0} isImminent={false} />,
    );

    expect(container.firstElementChild).toHaveTextContent(/^あと 0:04$/);
  });

  it("uses approachable Japanese labels for pour progress and cumulative targets", async () => {
    await act(() => i18n.changeLanguage("ja"));
    const props = { step: firstStep, stepIndex: 3, totalSteps: 10, remainingSeconds: 15,
      progress: 0.5, isImminent: false, steps: [firstStep], currentTime: 45,
      nextStepPreview: <NextStepPreview step={{ ...firstStep, cumulative: 60 }} /> };

    render(<StepCard {...props} status="running" startupSeconds={null} />);

    expect(screen.getByLabelText("4 / 10 回")).toBeVisible();
    expect(screen.getByRole("heading", { name: "お湯を注ぐ" })).toBeVisible();
    expect(screen.getByLabelText("お湯の合計目標 30gまで")).toHaveTextContent("30gまで");
    expect(screen.getByText("次に注ぐまで")).toBeVisible();
    expect(screen.getByText("次は").parentElement).toHaveTextContent("次は60gまで");
  });


  it("shows the actual next target immediately, without counting up from zero", () => {
    const { rerender } = render(<NextStepPreview step={firstStep} expanded />);
    expect(screen.getByText("30g")).toBeInTheDocument();
    expect(screen.queryByText("0g")).not.toBeInTheDocument();
    expect(screen.getByText("30g").parentElement).toHaveAttribute("data-expanded", "true");
    rerender(<NextStepPreview step={firstStep} />);
    expect(screen.getByText("30g").parentElement).not.toHaveAttribute("data-expanded");
  });

  it("shows only the start countdown centrally and the first target in Next while starting", () => {
    const props = { step: firstStep, stepIndex: 0, totalSteps: 10, remainingSeconds: 30,
      progress: 0, isImminent: false, steps: [firstStep], currentTime: 0,
      nextStepPreview: <NextStepPreview step={firstStep} expanded /> };
    const { rerender } = render(<StepCard {...props} status="idle" startupSeconds={5} />);
    expect(screen.getByRole("heading", { name: "Starting in" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Waiting to start");
    expect(screen.getByLabelText("Starting in 5s")).toHaveTextContent("5sec");
    expect(screen.getByText("30g")).toBeVisible();
    expect(screen.getByText("30g").closest("[data-expanded]")).toHaveAttribute("data-expanded", "true");
    expect(screen.getByText("30g").closest("section")?.querySelectorAll('[data-expanded="true"]')).toHaveLength(2);
    expect(screen.getByText("Next pour in").parentElement).toHaveAttribute("aria-hidden", "true");
    rerender(<StepCard {...props} status="running" startupSeconds={null} />);
    expect(screen.getByRole("heading", { name: "Bloom" })).toBeVisible();
    expect(screen.getByText("30")).toBeVisible();
    expect(screen.getByText("30g").closest("section")?.querySelectorAll('[data-expanded="true"]')).toHaveLength(1);
    rerender(<StepCard {...props} status="paused" startupSeconds={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("Paused");
  });

  it("renders the selected decorative preview without exposing it to assistive technology", () => {
    const { rerender } = render(<NextStepPreview step={firstStep} animationMode="handdrawn" animationProgress={0} animationRunning={false} />);
    const animation = screen.getByTestId("pour-animation-handdrawn");
    expect(animation).toHaveAttribute("aria-hidden", "true");
    expect(animation).toHaveAttribute("data-running", "false");
    expect(screen.getByText("30g")).toBeVisible();
    rerender(<NextStepPreview step={firstStep} animationMode="handdrawn" animationProgress={0.2} animationRunning />);
    expect(screen.getByTestId("pour-animation-handdrawn")).toHaveAttribute("data-running", "true");
  });
});

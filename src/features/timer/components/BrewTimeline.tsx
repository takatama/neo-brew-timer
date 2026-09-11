import { useTranslation } from "react-i18next";
import type { ComputedStep } from "../../recipe/types";
import { TimerTimeline } from "../../../shared/brew-timer";

interface Props {
  steps: ComputedStep[];
  currentStepIndex: number;
  currentTime: number;
}

export function BrewTimeline({ steps, currentStepIndex, currentTime }: Props) {
  const { t } = useTranslation();
  return (
    <TimerTimeline
      steps={steps}
      currentStepIndex={currentStepIndex}
      currentTime={currentTime}
      ariaLabel={t("timer.timeline")}
    />
  );
}

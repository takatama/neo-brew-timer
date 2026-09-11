import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import type { ComputedStep } from "../../recipe/types";
import type { TimerStatus } from "../hooks/useTimer";
import { formatTime } from "../../recipe/waterCalc";
import { BrewStepCardFrame } from "../../../shared/brew-timer";
import { Countdown } from "./Countdown";
import { BrewTimeline } from "./BrewTimeline";
import styles from "./StepCard.module.css";
interface Props {
  step: ComputedStep; stepIndex: number; totalSteps: number;
  remainingSeconds: number; progress: number; isImminent: boolean;
  nextStepPreview?: ReactNode; steps: ComputedStep[]; currentTime: number;
  status: TimerStatus; startupSeconds: number | null;
}
export function StepCard({ step, stepIndex, totalSteps, remainingSeconds,
  progress, isImminent, nextStepPreview, steps, currentTime, status, startupSeconds }: Props) {
  const { t } = useTranslation();
  const preparing = status === "idle";
  const lastPour = stepIndex === totalSteps - 1;
  const stateLabel = startupSeconds !== null ? t("timer.starting", { seconds: startupSeconds }) : t("timer.state_" + status);
  return (
    <BrewStepCardFrame
      ariaLabel={t("timer.pourCount", { current: stepIndex + 1, total: totalSteps })}
      isImminent={isImminent && status === "running"}
      stepLabel={<>
        <span>{t("timer.pourCount", { current: stepIndex + 1, total: totalSteps })}</span>
        <span className={styles.status} role="status">{stateLabel}</span>
      </>}
      instruction={<div aria-live="polite" aria-atomic="true">
        <h1 className={styles.stepVerb}>{preparing ? t("timer.getReady") : t(stepIndex === 0 ? "timer.bloom" : lastPour ? "timer.lastPour" : "timer.pour")}</h1>
        <div className={styles.target} aria-label={t("timer.targetAccessible", { amount: step.cumulative })}>{step.cumulative}<span>g</span></div>
      </div>}
      countdown={<>
        <span className={styles.targetLabel}>{t(lastPour ? "timer.untilFinish" : "timer.untilNext")}</span>
        <Countdown remainingSeconds={remainingSeconds} progress={progress} isImminent={isImminent} />
      </>}
      preview={nextStepPreview}
      timeline={<>
      <div className={styles.overall}>
        <span>{t("timer.elapsed")}</span><span>{formatTime(currentTime)} / {formatTime(steps[steps.length - 1]?.timeSec ?? 0)}</span>
      </div>
      <div className={styles.timeline}><BrewTimeline steps={steps} currentStepIndex={stepIndex} currentTime={currentTime} /></div>
      </>}
    />
  );
}

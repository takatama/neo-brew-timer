import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import type { ComputedStep } from "../../recipe/types";
import type { TimerStatus } from "../hooks/useTimer";
import { formatTime } from "../../recipe/waterCalc";
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
    <section className={"card " + styles.primaryCard + (isImminent && status === "running" ? " " + styles.imminent : "")}>
      <div className={styles.meta}>
        <span>{t("timer.pourCount", { current: stepIndex + 1, total: totalSteps })}</span>
        <span className={styles.status} role="status">{stateLabel}</span>
      </div>
      <div className={styles.instruction} aria-live="polite" aria-atomic="true">
        <h1 className={styles.stepVerb}>{preparing ? t("timer.getReady") : t(stepIndex === 0 ? "timer.bloom" : lastPour ? "timer.lastPour" : "timer.pour")}</h1>
        <div className={styles.target} aria-label={t("timer.targetAccessible", { amount: step.cumulative })}>{step.cumulative}<span>g</span></div>
      </div>
      <div className={styles.countdown}>
        <span className={styles.targetLabel}>{t(lastPour ? "timer.untilFinish" : "timer.untilNext")}</span>
        <Countdown remainingSeconds={remainingSeconds} progress={progress} isImminent={isImminent} />
      </div>
      <div className={styles.nextStep}>{nextStepPreview}</div>
      <div className={styles.overall}>
        <span>{t("timer.elapsed")}</span><span>{formatTime(currentTime)} / {formatTime(steps[steps.length - 1]?.timeSec ?? 0)}</span>
      </div>
      <div className={styles.timeline}><BrewTimeline steps={steps} currentStepIndex={stepIndex} currentTime={currentTime} /></div>
    </section>
  );
}

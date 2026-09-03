import { useTranslation } from "react-i18next";
import type { ComputedStep } from "../../recipe/types";
import { formatTime } from "../../recipe/waterCalc";
import styles from "./Timeline.module.css";

interface Props {
  steps: ComputedStep[];
  currentStepIndex: number;
  currentTime: number;
}

export function Timeline({ steps, currentStepIndex, currentTime }: Props) {
  const { t } = useTranslation();
  const totalTime = steps.at(-1)?.timeSec ?? 0;
  const currentTimeRatio = totalTime
    ? Math.min(1, Math.max(0, currentTime / totalTime))
    : 0;

  return (
    <div
      className={styles.timeline}
      role="img"
      aria-label={t("timer.timeline")}
    >
      <span className={styles.timeLabel}>{formatTime(0)}</span>
      <div className={styles.track}>
        <div
          className={styles.elapsedLine}
          style={{ width: `${currentTimeRatio * 100}%` }}
        />
        <span
          className={styles.currentTime}
          style={{ left: `${currentTimeRatio * 100}%` }}
        />
        {steps.map((step, index) => {
          const position = totalTime ? (step.timeSec / totalTime) * 100 : 0;
          const isCurrent = index === currentStepIndex;
          const isPassed = index < currentStepIndex;
          return (
            <span
              key={`${step.timeSec}-${step.actionType}`}
              className={`${styles.stepNode}${isPassed ? ` ${styles.passedStep}` : ""}${isCurrent ? ` ${styles.currentStep}` : ""}`}
              style={{ left: `${position}%` }}
            />
          );
        })}
      </div>
      <span className={`${styles.timeLabel} ${styles.endTime}`}>
        {formatTime(totalTime)}
      </span>
    </div>
  );
}

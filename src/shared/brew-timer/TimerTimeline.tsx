import { formatTimerTime } from "./timerMath";
import type { TimerStep } from "./types";
import styles from "./TimerTimeline.module.css";

interface TimerTimelineProps {
  steps: readonly Pick<TimerStep, "timeSec">[];
  currentStepIndex: number;
  currentTime: number;
  ariaLabel: string;
}

export function TimerTimeline({
  steps,
  currentStepIndex,
  currentTime,
  ariaLabel,
}: TimerTimelineProps) {
  const totalTime = steps.length > 0 ? steps[steps.length - 1].timeSec : 0;
  const currentTimeRatio = totalTime
    ? Math.min(1, Math.max(0, currentTime / totalTime))
    : 0;

  return (
    <div className={styles.timeline} role="img" aria-label={ariaLabel}>
      <span className={styles.timeLabel}>{formatTimerTime(0)}</span>
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
              key={`${step.timeSec}-${index}`}
              className={`${styles.stepNode}${isPassed ? ` ${styles.passedStep}` : ""}${isCurrent ? ` ${styles.currentStep}` : ""}`}
              style={{ left: `${position}%` }}
            />
          );
        })}
      </div>
      <span className={`${styles.timeLabel} ${styles.endTime}`}>
        {formatTimerTime(totalTime)}
      </span>
    </div>
  );
}

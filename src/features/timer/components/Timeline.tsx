import type { ComputedStep } from "../../recipe/types";
import { formatTime } from "../../recipe/waterCalc";
import styles from "./Timeline.module.css";

interface Props {
  steps: ComputedStep[];
  currentStepIndex: number;
  currentTime: number;
}

export function Timeline({ steps, currentStepIndex, currentTime }: Props) {
  const totalTime = steps.length > 0 ? steps[steps.length - 1].timeSec : 0;
  const nowRatio = totalTime ? Math.min(1, Math.max(0, currentTime / totalTime)) : 0;

  const timelineContent = (
    <div className={styles.timelineRow} aria-label={`${formatTime(currentTime)} / ${formatTime(totalTime)}`}>
      <span className={styles.timeLabel}>{formatTime(0)}</span>
      <div className={styles.timelineStepper}>
        <div className={styles.timelineLine} />
        <div className={styles.timelineProgress} style={{ width: `${nowRatio * 100}%` }} />
        <div className={styles.timelineNow} style={{ left: `${nowRatio * 100}%` }} />
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const classes = [
            styles.step,
            isCurrent ? styles.current : "",
            isCompleted ? styles.completed : "",
          ]
            .filter(Boolean)
            .join(" ");
          const ratio = totalTime ? step.timeSec / totalTime : 0;
          const left = ratio * 100;
          return (
            <div key={`${step.timeSec}-${step.actionType}`} className={classes} style={{ left: `${left}%` }} />
          );
        })}
      </div>
      <span className={styles.timeLabel}>{formatTime(totalTime)}</span>
    </div>
  );

  return timelineContent;
}

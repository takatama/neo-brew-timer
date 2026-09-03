import type { ComputedStep } from "../../recipe/types";
import { formatTime } from "../../recipe/waterCalc";
import styles from "./Timeline.module.css";

interface Props {
  steps: ComputedStep[];
  currentStepIndex: number;
  currentTime: number;
  hideCard?: boolean;
}

export function Timeline({ steps, currentStepIndex, currentTime, hideCard = false }: Props) {
  const totalTime = steps.length > 0 ? steps[steps.length - 1].timeSec : 0;
  const nowRatio = totalTime ? Math.min(1, Math.max(0, currentTime / totalTime)) : 0;

  const timelineContent = (
    <>
      <div className={styles.timelineStepper} aria-label={`${formatTime(currentTime)} / ${formatTime(totalTime)}`}>
        <div className={styles.timelineLine} />
        <div className={styles.timelineProgress} style={{ width: `${nowRatio * 100}%` }} />
        <div className={styles.timelineNow} style={{ left: `${nowRatio * 100}%` }} />
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const classes = [
            styles.step,
            isCurrent ? styles.current : "",
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
      <div className={styles.timeLabels}>
        <span>{formatTime(0)}</span>
        <span>{formatTime(totalTime)}</span>
      </div>
    </>
  );

  if (hideCard) {
    return timelineContent;
  }

  return (
    <section className={`card ${styles.timelineCard}`}>
      {timelineContent}
    </section>
  );
}

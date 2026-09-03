import { formatTime } from "../../recipe/waterCalc";
import styles from "./Countdown.module.css";

interface Props {
  remainingSeconds: number;
  progress: number;
  isImminent: boolean;
}

export function Countdown({ remainingSeconds, progress, isImminent }: Props) {
  return (
    <>
      <div className={styles.stepTime}>
        {formatTime(Math.max(0, Math.ceil(remainingSeconds)))}
      </div>
      <div className={styles.progress} aria-hidden="true">
        <div className={`${styles.progressFill}${isImminent ? ` ${styles.imminent}` : ""}`} style={{ width: `${(progress * 100).toFixed(2)}%` }} />
      </div>
    </>
  );
}

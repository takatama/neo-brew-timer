import { Trans } from "react-i18next";
import { formatTime } from "../../recipe/waterCalc";
import styles from "./Countdown.module.css";

interface Props {
  remainingSeconds: number;
  progress: number;
  isImminent: boolean;
}

export function Countdown({ remainingSeconds, progress, isImminent }: Props) {
  const formattedTime = formatTime(Math.max(0, Math.ceil(remainingSeconds)));

  return (
    <>
      <div className={styles.stepTime}>
        <Trans
          i18nKey="timer.remaining"
          values={{ time: formattedTime }}
          components={{ time: <span className={styles.timeValue} /> }}
        />
      </div>
      <div className={styles.progress}>
        <div
          className={`${styles.progressFill}${isImminent ? ` ${styles.imminent}` : ""}`}
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>
    </>
  );
}

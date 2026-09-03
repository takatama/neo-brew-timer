import { formatTime } from "../../recipe/waterCalc";
import { useTranslation } from "react-i18next";
import styles from "./Countdown.module.css";

interface Props {
  remainingSeconds: number;
  progress: number;
  isImminent: boolean;
  nextTarget: number;
}

export function Countdown({ remainingSeconds, progress, isImminent, nextTarget }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.stepTime}>
        {formatTime(Math.max(0, Math.ceil(remainingSeconds)))}
      </div>
      <div className={styles.nextTarget}>
        <span>{t("timer.nextStep")}</span> {nextTarget}g
      </div>
      <div className={styles.progress} aria-hidden="true">
        <div className={`${styles.progressFill}${isImminent ? ` ${styles.imminent}` : ""}`} style={{ width: `${(progress * 100).toFixed(2)}%` }} />
      </div>
    </>
  );
}

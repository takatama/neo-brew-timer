import { useTranslation } from "react-i18next";
import { formatTime } from "../../recipe/waterCalc";
import styles from "./Countdown.module.css";

interface Props {
  remainingSeconds: number;
  progress: number;
  isImminent: boolean;
}

export function Countdown({ remainingSeconds, progress, isImminent }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.stepTime}>
        <span className={styles.remainingLabel}>{t("timer.remaining")}</span>
        <span>{formatTime(Math.max(0, Math.ceil(remainingSeconds)))}</span>
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

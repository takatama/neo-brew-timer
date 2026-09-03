import { formatTime } from "../../recipe/waterCalc";
import styles from "./Countdown.module.css";

interface Props {
  remainingSeconds: number;
}

export function Countdown({ remainingSeconds }: Props) {
  return (
    <div className={styles.stepTime}>
      {formatTime(Math.max(0, Math.ceil(remainingSeconds)))}
    </div>
  );
}

import styles from "./TimerProgress.module.css";

interface TimerProgressProps {
  progress: number;
  isImminent: boolean;
}

export function TimerProgress({ progress, isImminent }: TimerProgressProps) {
  const safeProgress = Math.min(1, Math.max(0, progress));
  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeProgress * 100)}
      data-imminent={isImminent || undefined}
    >
      <div
        className={styles.progressFill}
        style={{ width: `${(safeProgress * 100).toFixed(2)}%` }}
      />
    </div>
  );
}

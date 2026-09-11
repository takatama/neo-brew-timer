import type { TimerStep } from "./types";

export function getCurrentStepIndex(
  steps: readonly Pick<TimerStep, "timeSec">[],
  currentTime: number,
): number {
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    if (currentTime >= steps[index].timeSec) return index;
  }
  return 0;
}

export function formatTimerTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

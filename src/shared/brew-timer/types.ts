export interface TimerStep {
  timeSec: number;
  isFinish: boolean;
}

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export interface PreNotifyEvent {
  nextStepIndex: number;
  isFinish: boolean;
}

export interface TimerCallbacks {
  onPreNotify?: (event: PreNotifyEvent) => void;
  onStepCrossed?: (stepIndex: number) => void;
}

export interface WakeLockControls {
  request: () => void | Promise<void>;
  release: () => void;
}

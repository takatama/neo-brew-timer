import { useCallback, useEffect, useRef, useState } from "react";
import type { ComputedStep } from "../../recipe/types";
import { getCurrentStepIndex } from "../../recipe/waterCalc";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

const TICK_INTERVAL_MS = 100;
const PRE_NOTIFY_SECONDS = 5;

interface TimerCallbacks {
  onPreNotify?: (nextStepIndex: number, isFinish: boolean) => void;
  onStepCrossed?: () => void;
}

export function useTimer(
  steps: ComputedStep[],
  speedMultiplier: number,
  callbacks: TimerCallbacks,
) {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const stateRef = useRef({
    elapsedMs: 0,
    lastAnnouncedStep: -1,
    lastFinishAnnounced: false,
  });

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const speedRef = useRef(speedMultiplier);
  speedRef.current = speedMultiplier;

  const currentTime = elapsedMs / 1000;
  const currentStepIndex = getCurrentStepIndex(steps, currentTime);
  const finalTime = steps.length > 0 ? steps[steps.length - 1].timeSec : 0;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    lastTickRef.current = null;
  }, []);

  const tick = useCallback(() => {
    const now = performance.now();
    const s = stateRef.current;
    const computedSteps = stepsRef.current;
    const speed = Math.max(1, speedRef.current);
    const final = computedSteps.length > 0 ? computedSteps[computedSteps.length - 1].timeSec : 0;

    if (lastTickRef.current === null) {
      lastTickRef.current = now;
    }
    const dt = Math.max(0, (now - lastTickRef.current) / 1000);
    lastTickRef.current = now;

    const prevTime = s.elapsedMs / 1000;
    s.elapsedMs = Math.min(final * 1000, s.elapsedMs + dt * speed * 1000);
    const curTime = s.elapsedMs / 1000;

    setElapsedMs(s.elapsedMs);

    const curIdx = getCurrentStepIndex(computedSteps, curTime);
    const nextStep = computedSteps[curIdx + 1];

    // Detect step boundary crossing
    const crossedStep = computedSteps.find(
      (step) => prevTime < step.timeSec && step.timeSec <= curTime,
    );
    if (crossedStep) {
      callbacksRef.current.onStepCrossed?.();
    }

    if (nextStep) {
      const prevRemaining = nextStep.timeSec - prevTime;
      const remaining = nextStep.timeSec - curTime;

      if (
        prevRemaining > PRE_NOTIFY_SECONDS &&
        remaining <= PRE_NOTIFY_SECONDS &&
        s.lastAnnouncedStep !== curIdx + 1
      ) {
        s.lastAnnouncedStep = curIdx + 1;
        const isFinish = nextStep.actionType === "none";
        callbacksRef.current.onPreNotify?.(curIdx + 1, isFinish);
      }
    } else {
      const prevRemaining = final - prevTime;
      const remaining = final - curTime;

      if (
        prevRemaining > PRE_NOTIFY_SECONDS &&
        remaining <= PRE_NOTIFY_SECONDS &&
        !s.lastFinishAnnounced
      ) {
        s.lastFinishAnnounced = true;
        callbacksRef.current.onPreNotify?.(-1, true);
      }
    }

    if (curTime >= final) {
      setStatus("finished");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastTickRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stopInterval();
    lastTickRef.current = performance.now();
    setStatus("running");
    intervalRef.current = setInterval(tick, TICK_INTERVAL_MS);
  }, [tick, stopInterval]);

  const pause = useCallback(() => {
    if (intervalRef.current !== null) tick();
    const complete = stateRef.current.elapsedMs >= (stepsRef.current[stepsRef.current.length - 1]?.timeSec ?? 0) * 1000;
    stopInterval();
    setStatus(complete ? "finished" : "paused");
  }, [stopInterval, tick]);

  const reset = useCallback(() => {
    stopInterval();
    stateRef.current = {
      elapsedMs: 0,
      lastAnnouncedStep: -1,
      lastFinishAnnounced: false,
    };
    setElapsedMs(0);
    setStatus("idle");
  }, [stopInterval]);

  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  return {
    status,
    currentTime,
    currentStepIndex,
    finalTime,
    start,
    pause,
    reset,
  };
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { PreNotifyEvent, TimerCallbacks, TimerStep, WakeLockControls } from "./types";
import { useBrewTimer } from "./useBrewTimer";

interface BrewTimerControllerOptions extends TimerCallbacks {
  steps: readonly TimerStep[];
  speedMultiplier: number;
  startDelayMs: number;
  wakeLock: WakeLockControls;
  onStart?: () => void;
}

export function useBrewTimerController({
  steps,
  speedMultiplier,
  startDelayMs,
  wakeLock,
  onStart,
  onPreNotify,
  onStepCrossed,
}: BrewTimerControllerOptions) {
  const [isStarting, setIsStarting] = useState(false);
  const [previewStepIndex, setPreviewStepIndex] = useState<number | null>(null);
  const startDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStartingRef = useRef(false);
  const startNotifiedRef = useRef(false);

  const optionsRef = useRef({ startDelayMs, wakeLock, onStart });
  optionsRef.current = { startDelayMs, wakeLock, onStart };

  const handlePreNotify = useCallback((event: PreNotifyEvent) => {
    if (!event.isFinish && optionsRef.current.startDelayMs > 0) {
      setPreviewStepIndex(event.nextStepIndex);
    }
    onPreNotify?.(event);
  }, [onPreNotify]);

  const handleStepCrossed = useCallback((stepIndex: number) => {
    setPreviewStepIndex(null);
    onStepCrossed?.(stepIndex);
  }, [onStepCrossed]);

  const timer = useBrewTimer(steps, speedMultiplier, {
    onPreNotify: handlePreNotify,
    onStepCrossed: handleStepCrossed,
  });
  const timerRef = useRef(timer);
  timerRef.current = timer;

  const clearStartDelay = useCallback((resetNotification: boolean) => {
    if (startDelayRef.current) {
      clearTimeout(startDelayRef.current);
      startDelayRef.current = null;
    }
    isStartingRef.current = false;
    setIsStarting(false);
    setPreviewStepIndex(null);
    if (resetNotification) startNotifiedRef.current = false;
  }, []);

  const start = useCallback(() => {
    const currentTimer = timerRef.current;
    if (
      isStartingRef.current ||
      currentTimer.status === "running" ||
      currentTimer.status === "finished"
    ) {
      return;
    }

    const isFirstStart = currentTimer.currentTime === 0;
    const currentOptions = optionsRef.current;
    if (isFirstStart && !startNotifiedRef.current) {
      startNotifiedRef.current = true;
      currentOptions.onStart?.();
    }

    if (isFirstStart && currentOptions.startDelayMs > 0) {
      isStartingRef.current = true;
      setIsStarting(true);
      setPreviewStepIndex(0);
      void currentOptions.wakeLock.request();
      startDelayRef.current = setTimeout(() => {
        startDelayRef.current = null;
        isStartingRef.current = false;
        setIsStarting(false);
        setPreviewStepIndex(null);
        timerRef.current.start();
      }, currentOptions.startDelayMs);
      return;
    }

    currentTimer.start();
    void currentOptions.wakeLock.request();
  }, []);

  const pauseOrCancel = useCallback(() => {
    if (isStartingRef.current) {
      clearStartDelay(true);
      optionsRef.current.wakeLock.release();
      return;
    }
    if (timerRef.current.status === "running") {
      timerRef.current.pause();
      optionsRef.current.wakeLock.release();
    }
  }, [clearStartDelay]);

  const toggle = useCallback(() => {
    if (isStartingRef.current || timerRef.current.status === "running") {
      pauseOrCancel();
    } else {
      start();
    }
  }, [pauseOrCancel, start]);

  const reset = useCallback(() => {
    clearStartDelay(true);
    timerRef.current.reset();
    optionsRef.current.wakeLock.release();
  }, [clearStartDelay]);

  useEffect(() => {
    if (timer.status === "finished") {
      setPreviewStepIndex(null);
      optionsRef.current.wakeLock.release();
    }
  }, [timer.status]);

  useEffect(() => () => {
    if (startDelayRef.current) clearTimeout(startDelayRef.current);
    startDelayRef.current = null;
    isStartingRef.current = false;
    optionsRef.current.wakeLock.release();
  }, []);

  return {
    timer,
    isStarting,
    isRunningOrStarting: timer.status === "running" || isStarting,
    previewStepIndex,
    start,
    pauseOrCancel,
    toggle,
    reset,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSettingsStore } from "../../settings/store";
import { useSessionStore } from "../store";
import { neoBrewMethod, computeSteps, getTotalWater } from "../../recipe";
import { useTimer } from "./useTimer";
import { useWakeLock } from "./useWakeLock";
import { useNotification } from "./useNotification";

export function useTimerOrchestrator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { beans, flavor } = useSessionStore();
  const { debugSpeed, startDelay } = useSettingsStore();
  const { playSound, playFirstSound, vibrate, stop } = useNotification();
  const wakeLock = useWakeLock();

  const steps = useMemo(
    () => computeSteps(neoBrewMethod, beans, flavor),
    [beans, flavor],
  );
  const totalWater = getTotalWater(beans, neoBrewMethod.waterRatio);

  const startDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [startupSeconds, setStartupSeconds] = useState<number | null>(null);
  const startupDeadlineRef = useRef(0);

  useEffect(() => {
    if (startupSeconds === null) return;
    const id = setInterval(() => {
      if (startDelayRef.current === null) return;
      setStartupSeconds(Math.max(0, Math.ceil((startupDeadlineRef.current - performance.now()) / 1000)));
    }, 100);
    return () => clearInterval(id);
  }, [startupSeconds === null]);

  const onPreNotify = useCallback(
    (_nextStepIndex: number, isFinish: boolean) => {
      vibrate("pre-step");
      playSound(isFinish);
    },
    [vibrate, playSound],
  );

  const onStepCrossed = useCallback(() => {
    vibrate("step-change");
  }, [vibrate]);

  const timer = useTimer(steps, debugSpeed, {
    onPreNotify,
    onStepCrossed,
  });

  const currentStep = steps[timer.currentStepIndex];
  const nextStep = steps[timer.currentStepIndex + 1];

  const remainingToNext = nextStep
    ? Math.max(0, nextStep.timeSec - timer.currentTime)
    : Math.max(0, timer.finalTime - timer.currentTime);

  const stepStart = currentStep?.timeSec ?? 0;
  const stepEnd = nextStep ? nextStep.timeSec : timer.finalTime;
  const stepDuration = Math.max(1, stepEnd - stepStart);
  const elapsed = Math.max(0, timer.currentTime - stepStart);
  const progress = Math.min(1, elapsed / stepDuration);
  const isImminent = remainingToNext > 0 && remainingToNext <= 5;

  const startBrew = useCallback(() => {
    if (startDelayRef.current !== null) return;
    if (!startDelay) {
      timer.start();
      vibrate("step-change");
      wakeLock.request();
      return;
    }
    startupDeadlineRef.current = performance.now() + 5000;
    setStartupSeconds(5);
    vibrate("pre-step");
    playFirstSound();
    wakeLock.request();
    startDelayRef.current = setTimeout(() => {
      startDelayRef.current = null;
      setStartupSeconds(null);
      timer.start();
    }, 5000);
  }, [startDelay, playFirstSound, timer, vibrate, wakeLock]);

  const handlePlayPause = useCallback(() => {
    // Cancel pending startup countdown first, if any
    if (startDelayRef.current) {
      clearTimeout(startDelayRef.current);
      startDelayRef.current = null;
      setStartupSeconds(null);
      stop();
      wakeLock.release();
      return;
    }

    if (timer.status === "running") {
      timer.pause();
      stop();
      wakeLock.release();
    } else if (timer.status !== "finished") {
      if (timer.status === "idle") {
        startBrew();
      } else {
        timer.start();
        wakeLock.request();
      }
    }
  }, [timer, wakeLock, startBrew, stop]);

  const handleReset = useCallback(() => {
    if (startDelayRef.current) {
      clearTimeout(startDelayRef.current);
      startDelayRef.current = null;
    }
    setStartupSeconds(null);
    stop();
    timer.reset();
    wakeLock.release();
  }, [timer, wakeLock, stop]);

  // Auto-start if query param is set
  useEffect(() => {
    if (searchParams.get("autostart") === "1") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("autostart");
      setSearchParams(newParams, { replace: true });

      startBrew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Release wake lock on finish
  useEffect(() => {
    if (timer.status === "finished") {
      wakeLock.release();
    }
  }, [timer.status, wakeLock]);

  // Cleanup start delay on unmount
  useEffect(() => {
    return () => {
      if (startDelayRef.current) {
        clearTimeout(startDelayRef.current);
        startDelayRef.current = null;
      }
    };
  }, []);

  const isRunningOrStarting =
    timer.status === "running" || startDelayRef.current !== null;

  return {
    steps,
    beans,
    flavor,
    totalWater,
    currentStep,
    timer,
    remainingToNext,
    progress,
    isImminent,
    isRunningOrStarting,
    startupSeconds,
    wakeLock,
    handlePlayPause,
    handleReset,
  };
}

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
  const { debugSpeed, animation } = useSettingsStore();
  const { playSound, playFirstSound, vibrate } = useNotification();
  const wakeLock = useWakeLock();

  const steps = useMemo(
    () => computeSteps(neoBrewMethod, beans, flavor),
    [beans, flavor],
  );
  const totalWater = getTotalWater(beans, neoBrewMethod.waterRatio);

  const [overlayStep, setOverlayStep] = useState<{
    index: number;
    prevCumulative: number;
  } | null>(null);

  const startDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyPreStep = useCallback(
    (isFinish: boolean) => {
      vibrate("pre-step");
      playSound(isFinish);
    },
    [vibrate, playSound],
  );

  const onPreNotify = useCallback(
    (nextStepIndex: number, isFinish: boolean) => {
      notifyPreStep(isFinish);
      if (!isFinish && nextStepIndex >= 0 && animation) {
        const prevCumulative =
          nextStepIndex > 0 ? steps[nextStepIndex - 1].cumulative : 0;
        setOverlayStep({ index: nextStepIndex, prevCumulative });
      }
    },
    [notifyPreStep, animation, steps],
  );

  const onStepCrossed = useCallback(() => {
    vibrate("step-change");
  }, [vibrate]);

  const onOverlayExpired = useCallback(() => {
    setOverlayStep(null);
  }, []);

  const timer = useTimer(steps, debugSpeed, {
    onPreNotify,
    onStepCrossed,
    onOverlayExpired,
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

  const startWithAnimation = useCallback(() => {
    vibrate("pre-step");
    playFirstSound();
    setOverlayStep({ index: 0, prevCumulative: 0 });
    timer.setOverlayStep(0);
    wakeLock.request();
    startDelayRef.current = setTimeout(() => {
      startDelayRef.current = null;
      setOverlayStep(null);
      timer.start();
    }, 5000);
  }, [playFirstSound, timer, vibrate, wakeLock]);

  const handlePlayPause = useCallback(() => {
    // Cancel pending startup countdown first, if any
    if (startDelayRef.current) {
      clearTimeout(startDelayRef.current);
      startDelayRef.current = null;
      setOverlayStep(null);
      wakeLock.release();
      return;
    }

    if (timer.status === "running") {
      timer.pause();
      wakeLock.release();
    } else {
      if (timer.currentTime === 0 && animation) {
        startWithAnimation();
      } else {
        if (timer.currentTime === 0) {
          playFirstSound();
        }
        timer.start();
        wakeLock.request();
      }
    }
  }, [timer, animation, wakeLock, startWithAnimation, playFirstSound]);

  const handleReset = useCallback(() => {
    if (startDelayRef.current) {
      clearTimeout(startDelayRef.current);
      startDelayRef.current = null;
    }
    setOverlayStep(null);
    timer.reset();
    wakeLock.release();
  }, [timer, wakeLock]);

  // Auto-start if query param is set
  useEffect(() => {
    if (searchParams.get("autostart") === "1") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("autostart");
      setSearchParams(newParams, { replace: true });

      if (animation) {
        startWithAnimation();
      } else {
        playFirstSound();
        timer.start();
        wakeLock.request();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Release wake lock on finish
  useEffect(() => {
    if (timer.status === "finished") {
      setOverlayStep(null);
      wakeLock.release();
    }
  }, [timer.status, wakeLock]);

  // Cleanup start delay on unmount
  useEffect(() => {
    return () => {
      if (startDelayRef.current) {
        clearTimeout(startDelayRef.current);
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
    overlayStep,
    remainingToNext,
    progress,
    isImminent,
    isRunningOrStarting,
    animation,
    wakeLock,
    handlePlayPause,
    handleReset,
  };
}

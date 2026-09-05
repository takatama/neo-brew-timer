import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSettingsStore } from "../../settings/store";
import { useSessionStore } from "../store";
import { neoBrewMethod, computeSteps, getTotalWater } from "../../recipe";
import {
  useBrewTimerController,
  useWakeLock,
  type PreNotifyEvent,
} from "../../../shared/brew-timer";
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
  const timerSteps = useMemo(
    () => steps.map((step) => ({
      timeSec: step.timeSec,
      isFinish: step.actionType === "none",
    })),
    [steps],
  );
  const totalWater = getTotalWater(beans, neoBrewMethod.waterRatio);

  const onPreNotify = useCallback(
    ({ isFinish }: PreNotifyEvent) => {
      vibrate("pre-step");
      playSound(isFinish);
    },
    [playSound, vibrate],
  );

  const onStart = useCallback(() => {
    vibrate("pre-step");
    playFirstSound();
  }, [playFirstSound, vibrate]);

  const onStepCrossed = useCallback(() => {
    vibrate("step-change");
  }, [vibrate]);

  const controller = useBrewTimerController({
    steps: timerSteps,
    speedMultiplier: debugSpeed,
    startDelayMs: animation ? 5000 : 0,
    wakeLock,
    onStart,
    onPreNotify,
    onStepCrossed,
  });
  const { timer } = controller;

  const currentStep = steps[timer.currentStepIndex];
  const nextStep = steps[timer.currentStepIndex + 1];
  const overlayStep = controller.previewStepIndex === null
    ? null
    : {
        index: controller.previewStepIndex,
        prevCumulative: controller.previewStepIndex > 0
          ? steps[controller.previewStepIndex - 1]?.cumulative ?? 0
          : 0,
      };

  const remainingToNext = nextStep
    ? Math.max(0, nextStep.timeSec - timer.currentTime)
    : Math.max(0, timer.finalTime - timer.currentTime);

  const stepStart = currentStep?.timeSec ?? 0;
  const stepEnd = nextStep ? nextStep.timeSec : timer.finalTime;
  const stepDuration = Math.max(1, stepEnd - stepStart);
  const elapsed = Math.max(0, timer.currentTime - stepStart);
  const progress = Math.min(1, elapsed / stepDuration);
  const isImminent = remainingToNext > 0 && remainingToNext <= 5;

  const autoStartParamsRef = useRef(
    searchParams.get("autostart") === "1"
      ? new URLSearchParams(searchParams)
      : null,
  );

  // URL handling stays in the app layer; the shared controller only receives start().
  useEffect(() => {
    const newParams = autoStartParamsRef.current;
    if (!newParams) return;
    newParams.delete("autostart");
    setSearchParams(newParams, { replace: true });
    controller.start();
  }, [controller.start, setSearchParams]);

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
    isRunningOrStarting: controller.isRunningOrStarting,
    animation,
    wakeLock,
    handlePlayPause: controller.toggle,
    handleReset: controller.reset,
  };
}

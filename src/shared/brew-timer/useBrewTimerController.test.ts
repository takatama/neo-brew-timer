import { StrictMode, createElement, useEffect, type ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBrewTimerController } from "./useBrewTimerController";
import type { TimerStep, WakeLockControls } from "./types";

const steps: TimerStep[] = [
  { timeSec: 0, isFinish: false },
  { timeSec: 30, isFinish: false },
  { timeSec: 60, isFinish: true },
];

function makeWakeLock() {
  const request = vi.fn<() => void>();
  const release = vi.fn<() => void>();
  return { request, release } satisfies WakeLockControls;
}

describe("useBrewTimerController", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("cancels a pending start without letting it return later", () => {
    const wakeLock = makeWakeLock();
    const onStart = vi.fn();
    const { result } = renderHook(() => useBrewTimerController({
      steps,
      speedMultiplier: 1,
      startDelayMs: 5000,
      wakeLock,
      onStart,
    }));

    act(() => result.current.start());
    expect(result.current.isStarting).toBe(true);
    expect(result.current.previewStepIndex).toBe(0);

    act(() => result.current.pauseOrCancel());
    act(() => vi.advanceTimersByTime(6000));

    expect(result.current.timer.status).toBe("idle");
    expect(result.current.previewStepIndex).toBeNull();
    expect(wakeLock.release).toHaveBeenCalled();
  });

  it("does not leave a delayed start behind after unmount", () => {
    const wakeLock = makeWakeLock();
    const { result, unmount } = renderHook(() => useBrewTimerController({
      steps,
      speedMultiplier: 1,
      startDelayMs: 5000,
      wakeLock,
    }));

    act(() => result.current.start());
    unmount();
    act(() => vi.advanceTimersByTime(6000));

    expect(wakeLock.release).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("survives StrictMode auto-start without two active starts", () => {
    const wakeLock = makeWakeLock();
    const onStart = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(StrictMode, null, children);
    const { result } = renderHook(() => {
      const controller = useBrewTimerController({
        steps,
        speedMultiplier: 1,
        startDelayMs: 5000,
        wakeLock,
        onStart,
      });
      useEffect(() => controller.start(), [controller.start]);
      return controller;
    }, { wrapper });

    expect(result.current.isStarting).toBe(true);
    expect(onStart).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.timer.status).toBe("running");
    expect(vi.getTimerCount()).toBe(1);
  });
});

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TimerStep } from "./types";
import { useBrewTimer } from "./useBrewTimer";

const makeSteps = (): TimerStep[] => [
  { timeSec: 0, isFinish: false },
  { timeSec: 30, isFinish: false },
  { timeSec: 45, isFinish: false },
  { timeSec: 210, isFinish: true },
];

describe("useBrewTimer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts, pauses, and resets", () => {
    const { result } = renderHook(() => useBrewTimer(makeSteps(), 1));
    expect(result.current.status).toBe("idle");

    act(() => result.current.start());
    expect(result.current.status).toBe("running");

    act(() => result.current.pause());
    expect(result.current.status).toBe("paused");

    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.currentTime).toBe(0);
  });

  it("derives the final time without recipe fields", () => {
    const { result } = renderHook(() => useBrewTimer(makeSteps(), 1));
    expect(result.current.finalTime).toBe(210);
    expect(result.current.currentStepIndex).toBe(0);
  });

  it("handles an empty schedule", () => {
    const { result } = renderHook(() => useBrewTimer([], 1));
    expect(result.current.finalTime).toBe(0);
    expect(result.current.currentStepIndex).toBe(0);
  });

  it("reports a crossed step", () => {
    const onStepCrossed = vi.fn();
    const { result } = renderHook(() => useBrewTimer(makeSteps(), 1, {
      onStepCrossed,
    }));
    act(() => result.current.start());

    const startTime = performance.now();
    vi.spyOn(performance, "now").mockReturnValue(startTime + 31000);
    act(() => vi.advanceTimersByTime(100));

    expect(onStepCrossed).toHaveBeenCalledWith(1);
    vi.restoreAllMocks();
  });

  it("reports the next step exactly at the five-second threshold", () => {
    const onPreNotify = vi.fn();
    const { result } = renderHook(() => useBrewTimer(makeSteps(), 1, {
      onPreNotify,
    }));
    act(() => result.current.start());

    const startTime = performance.now();
    vi.spyOn(performance, "now").mockReturnValue(startTime + 25100);
    act(() => vi.advanceTimersByTime(100));

    expect(onPreNotify).toHaveBeenCalledOnce();
    expect(onPreNotify).toHaveBeenCalledWith({
      nextStepIndex: 1,
      isFinish: false,
    });
    vi.restoreAllMocks();
  });
});

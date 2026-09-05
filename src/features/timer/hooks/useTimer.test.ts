import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimer } from "./useTimer";
import type { TimerStep } from "../../../shared/brew-timer";

const makeSteps = (): TimerStep[] => [
  { timeSec: 0, isFinish: false },
  { timeSec: 30, isFinish: false },
  { timeSec: 45, isFinish: false },
  { timeSec: 210, isFinish: true },
];

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in idle status", () => {
    const { result } = renderHook(() =>
      useTimer(makeSteps(), 1, {}),
    );
    expect(result.current.status).toBe("idle");
    expect(result.current.currentTime).toBe(0);
    expect(result.current.currentStepIndex).toBe(0);
  });

  it("transitions to running on start", () => {
    const { result } = renderHook(() =>
      useTimer(makeSteps(), 1, {}),
    );
    act(() => {
      result.current.start();
    });
    expect(result.current.status).toBe("running");
  });

  it("transitions to paused on pause", () => {
    const { result } = renderHook(() =>
      useTimer(makeSteps(), 1, {}),
    );
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.pause();
    });
    expect(result.current.status).toBe("paused");
  });

  it("resets to initial state", () => {
    const { result } = renderHook(() =>
      useTimer(makeSteps(), 1, {}),
    );
    act(() => {
      result.current.start();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.currentTime).toBe(0);
  });

  it("computes finalTime from last step", () => {
    const { result } = renderHook(() =>
      useTimer(makeSteps(), 1, {}),
    );
    expect(result.current.finalTime).toBe(210);
  });

  it("handles empty steps array", () => {
    const { result } = renderHook(() =>
      useTimer([], 1, {}),
    );
    expect(result.current.finalTime).toBe(0);
    expect(result.current.currentStepIndex).toBe(0);
  });

  it("fires onStepCrossed when crossing step boundary", () => {
    const onStepCrossed = vi.fn();
    const steps = makeSteps();

    const { result } = renderHook(() =>
      useTimer(steps, 1, { onStepCrossed }),
    );

    act(() => {
      result.current.start();
    });

    // Advance performance.now by 31 seconds to cross step 1 boundary (30s)
    const startTime = performance.now();
    vi.spyOn(performance, "now").mockReturnValue(startTime + 31000);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onStepCrossed).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("fires onPreNotify 5 seconds before next step", () => {
    const onPreNotify = vi.fn();
    const steps = makeSteps();

    const { result } = renderHook(() =>
      useTimer(steps, 1, { onPreNotify }),
    );

    act(() => {
      result.current.start();
    });

    // Advance to 25.1 seconds (5 seconds before step at 30s)
    const startTime = performance.now();
    vi.spyOn(performance, "now").mockReturnValue(startTime + 25100);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onPreNotify).toHaveBeenCalledWith({
      nextStepIndex: 1,
      isFinish: false,
    });

    vi.restoreAllMocks();
  });
});

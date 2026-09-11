import { StrictMode, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { useTimerOrchestrator } from "./useTimerOrchestrator";
import { useSettingsStore } from "../../settings/store";
const notification = vi.hoisted(() => ({ playSound: vi.fn(), playFirstSound: vi.fn(), vibrate: vi.fn(), stop: vi.fn() }));
vi.mock("./useNotification", () => ({ useNotification: () => notification }));
function wrapper({ children }: { children: ReactNode }) { return <StrictMode><MemoryRouter initialEntries={["/timer?autostart=1"]}>{children}</MemoryRouter></StrictMode>; }
beforeEach(() => { vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "performance"] }); vi.clearAllMocks(); useSettingsStore.setState({ startDelay: true, debugSpeed: 1 }); });
afterEach(() => vi.useRealTimers());
describe("brewing startup", () => {
  it("starts immediately without countdown audio when preparation delay is off", () => {
    useSettingsStore.setState({ startDelay: false });
    const { result } = renderHook(useTimerOrchestrator, { wrapper });
    expect(result.current.startupSeconds).toBeNull();
    expect(result.current.timer.status).toBe("running");
    expect(notification.playFirstSound).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.timer.currentTime).toBeCloseTo(1);
    act(() => result.current.handleReset());
    act(() => result.current.handlePlayPause());
    expect(result.current.timer.status).toBe("running");
    expect(result.current.startupSeconds).toBeNull();
  });
  it("gives five seconds to prepare including StrictMode", () => {
    const { result } = renderHook(useTimerOrchestrator, { wrapper });
    expect(result.current.startupSeconds).toBe(5);
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.startupSeconds).toBe(1);
    expect(result.current.timer.status).toBe("idle");
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.startupSeconds).toBeNull();
    expect(result.current.timer.status).toBe("running");
    expect(result.current.timer.currentTime).toBeCloseTo(1);
  });
  it("cancels the delayed start and voice, then allows a fresh retry", () => {
    const { result } = renderHook(useTimerOrchestrator, { wrapper });
    act(() => vi.advanceTimersByTime(2000));
    act(() => result.current.handlePlayPause());
    expect(notification.stop).toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(6000));
    expect(result.current.timer.status).toBe("idle");
    expect(result.current.startupSeconds).toBeNull();
    act(() => result.current.handlePlayPause());
    act(() => vi.advanceTimersByTime(6000));
    expect(result.current.timer.status).toBe("running");
    act(() => result.current.handlePlayPause());
    const pausedTime = result.current.timer.currentTime;
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.timer.currentTime).toBe(pausedTime);
    act(() => result.current.handlePlayPause());
    expect(result.current.startupSeconds).toBeNull();
    expect(result.current.timer.status).toBe("running");
  });
  it("does not begin brewing after unmount during startup", () => {
    const { unmount } = renderHook(useTimerOrchestrator, { wrapper });
    unmount();
    act(() => vi.advanceTimersByTime(6000));
    expect(vi.getTimerCount()).toBe(0);
  });
});

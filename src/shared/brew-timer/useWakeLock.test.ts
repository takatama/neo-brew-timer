import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWakeLock } from "./useWakeLock";

function setup() {
  const lock = {
    release: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
  };
  let resolve!: (value: WakeLockSentinel) => void;
  const request = vi.fn(() => new Promise<WakeLockSentinel>((done) => {
    resolve = done;
  }));
  vi.stubGlobal("navigator", { wakeLock: { request } });
  return {
    lock,
    request,
    resolve: () => resolve(lock as unknown as WakeLockSentinel),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("useWakeLock", () => {
  it("releases a lock that arrives after stopping", async () => {
    const mock = setup();
    const { result } = renderHook(() => useWakeLock());
    let pending!: Promise<void>;
    act(() => { pending = result.current.request(); });
    act(() => result.current.release());
    await act(async () => { mock.resolve(); await pending; });
    expect(mock.lock.release).toHaveBeenCalledOnce();
    expect(result.current.isActive).toBe(false);
  });

  it("releases a lock that arrives after leaving the page", async () => {
    const mock = setup();
    const { result, unmount } = renderHook(() => useWakeLock());
    let pending!: Promise<void>;
    act(() => { pending = result.current.request(); });
    unmount();
    await act(async () => { mock.resolve(); await pending; });
    expect(mock.lock.release).toHaveBeenCalledOnce();
  });

  it("does not request two locks while acquisition is pending", async () => {
    const mock = setup();
    const { result, unmount } = renderHook(() => useWakeLock());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.request();
      void result.current.request();
    });
    expect(mock.request).toHaveBeenCalledOnce();
    await act(async () => { mock.resolve(); await pending; });
    unmount();
    expect(mock.lock.release).toHaveBeenCalledOnce();
  });
});

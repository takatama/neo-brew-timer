import { describe, expect, it, vi } from "vitest";
import { createWakeLock } from "./wakeLock";

function fakeSentinel() {
  const listeners: (() => void)[] = [];
  return {
    released: false,
    release: vi.fn(async function (this: { released: boolean }) {
      this.released = true;
      listeners.forEach((l) => l());
    }),
    addEventListener: (_: string, l: () => void) => listeners.push(l),
  };
}

function setup() {
  let resolve: ((s: ReturnType<typeof fakeSentinel>) => void) | null = null;
  const sentinels: ReturnType<typeof fakeSentinel>[] = [];
  const request = vi.fn(() => new Promise<ReturnType<typeof fakeSentinel>>((r) => {
    resolve = (s) => {
      sentinels.push(s);
      r(s);
    };
  }));
  const nav = { wakeLock: { request } } as unknown as Navigator;
  const doc = new EventTarget() as unknown as Document & { visibilityState: string };
  Object.defineProperty(doc, "visibilityState", { value: "visible", writable: true });
  const grant = () => resolve?.(fakeSentinel());
  return { nav, doc, request, grant, sentinels };
}

describe("screen wake lock", () => {
  it("holds the lock while wanted and releases it", async () => {
    const { nav, doc, request, grant, sentinels } = setup();
    const lock = createWakeLock(nav, doc);
    const pending = lock.request();
    grant();
    await pending;
    expect(request).toHaveBeenCalledTimes(1);
    lock.release();
    expect(sentinels[0].release).toHaveBeenCalled();
  });

  it("releases a lock that is granted after the brew already stopped", async () => {
    const { nav, doc, grant, sentinels } = setup();
    const lock = createWakeLock(nav, doc);
    const pending = lock.request();
    lock.release();
    grant();
    await pending;
    expect(sentinels[0].release).toHaveBeenCalled();
  });

  it("shares one pending request", async () => {
    const { nav, doc, request, grant } = setup();
    const lock = createWakeLock(nav, doc);
    const a = lock.request();
    const b = lock.request();
    grant();
    await Promise.all([a, b]);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("re-acquires when the page becomes visible again", async () => {
    const { nav, doc, request, grant, sentinels } = setup();
    const lock = createWakeLock(nav, doc);
    const first = lock.request();
    grant();
    await first;
    await sentinels[0].release(); // the browser dropped it while hidden
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(request).toHaveBeenCalledTimes(2);
    grant();
  });

  it("never throws when the API is missing or denied", async () => {
    const doc = new EventTarget() as unknown as Document;
    await expect(createWakeLock({} as Navigator, doc).request()).resolves.toBeUndefined();
    const denied = { wakeLock: { request: () => Promise.reject(new Error("denied")) } } as unknown as Navigator;
    await expect(createWakeLock(denied, doc).request()).resolves.toBeUndefined();
  });
});

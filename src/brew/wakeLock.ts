/**
 * Keeps the screen on while a brew is active. Unsupported or denied requests
 * never interrupt brewing. A lock granted after the brew has already stopped
 * is released immediately, and the lock is re-acquired when the page becomes
 * visible again (browsers drop it when the page is hidden).
 */
export interface WakeLockController {
  request(): Promise<void>;
  release(): void;
  readonly wanted: boolean;
  dispose(): void;
}

export function createWakeLock(nav: Navigator = navigator, doc: Document = document): WakeLockController {
  let sentinel: WakeLockSentinel | null = null;
  let pending: Promise<void> | null = null;
  let wanted = false;

  const acquire = (): Promise<void> => {
    if (!("wakeLock" in nav) || sentinel) return Promise.resolve();
    if (pending) return pending;
    const attempt = (async () => {
      try {
        const lock = await nav.wakeLock.request("screen");
        if (!wanted) {
          await lock.release();
          return;
        }
        sentinel = lock;
        lock.addEventListener("release", () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        // Unsupported, denied or not visible: brewing continues regardless.
      }
    })();
    pending = attempt;
    void attempt.then(() => {
      if (pending === attempt) pending = null;
    });
    return attempt;
  };

  const onVisibility = () => {
    if (doc.visibilityState === "visible" && wanted) void acquire();
  };
  doc.addEventListener("visibilitychange", onVisibility);

  return {
    request() {
      wanted = true;
      return acquire();
    },
    release() {
      wanted = false;
      const lock = sentinel;
      sentinel = null;
      if (lock) void lock.release().catch(() => {});
    },
    get wanted() {
      return wanted;
    },
    dispose() {
      doc.removeEventListener("visibilitychange", onVisibility);
      this.release();
    },
  };
}

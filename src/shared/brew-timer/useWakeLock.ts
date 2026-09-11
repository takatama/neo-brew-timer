import { useCallback, useEffect, useRef, useState } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const pendingRef = useRef<Promise<void> | null>(null);
  const [isActive, setIsActive] = useState(false);
  const isActiveRef = useRef(false);

  const acquire = useCallback((): Promise<void> => {
    if (!("wakeLock" in navigator) || wakeLockRef.current) return Promise.resolve();
    if (pendingRef.current) return pendingRef.current;
    const pending = (async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (!isActiveRef.current) {
          await lock.release();
          return;
        }
        wakeLockRef.current = lock;
        lock.addEventListener("release", () => {
          if (wakeLockRef.current === lock) wakeLockRef.current = null;
        });
      } catch {
        // Unsupported or denied requests must not interrupt brewing.
      }
    })();
    pendingRef.current = pending;
    void pending.then(() => {
      if (pendingRef.current === pending) pendingRef.current = null;
    });
    return pending;
  }, []);

  const request = useCallback(() => {
    isActiveRef.current = true;
    setIsActive(true);
    return acquire();
  }, [acquire]);

  const releaseLock = useCallback(() => {
    isActiveRef.current = false;
    const lock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (lock) void lock.release().catch(() => {});
  }, []);

  const release = useCallback(() => {
    releaseLock();
    setIsActive(false);
  }, [releaseLock]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isActiveRef.current) void acquire();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      releaseLock();
    };
  }, [acquire, releaseLock]);

  return { isActive, request, release };
}

import { describe, expect, it } from "vitest";
import { useWakeLock } from "./useWakeLock";
import { useWakeLock as useSharedWakeLock } from "../../../shared/brew-timer";

describe("useWakeLock compatibility export", () => {
  it("points to the shared wake-lock hook", () => {
    expect(useWakeLock).toBe(useSharedWakeLock);
  });
});

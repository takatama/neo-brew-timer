import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearVoiceAudio,
  getVoiceAudio,
  prepareVoiceCue,
  primeVoiceAudio,
  stopVoiceAudio,
} from "./voiceAudio";

describe("voice activation races", () => {
  let resolvePlay: () => void;
  let pause: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    clearVoiceAudio();
    pause = vi.fn();
    const pending = new Promise<void>((resolve) => {
      resolvePlay = resolve;
    });
    vi.stubGlobal(
      "Audio",
      class {
        paused = true;
        currentTime = 0;
        volume = 1;
        preload = "";
        load = vi.fn();
        pause = pause;
        play = vi.fn(() => pending);
      },
    );
  });
  afterEach(() => {
    clearVoiceAudio();
    vi.unstubAllGlobals();
  });
  it("a late silent warm-up does not pause a real cue", async () => {
    primeVoiceAudio("ja", "male");
    const first = getVoiceAudio("ja", "male").first;
    expect(first.volume).toBe(0);
    prepareVoiceCue(first);
    resolvePlay();
    await Promise.resolve();
    expect(first.volume).toBe(1);
    // Only next/finish, still doing their silent warm-up, are paused.
    expect(pause).toHaveBeenCalledTimes(2);
  });
  it("canceling before warm-up resolves leaves all audio quiet and ready for retry", async () => {
    primeVoiceAudio("ja", "female");
    stopVoiceAudio();
    resolvePlay();
    await Promise.resolve();
    expect(pause).toHaveBeenCalledTimes(3);
    expect(
      Object.values(getVoiceAudio("ja", "female")).map((audio) => audio.volume),
    ).toEqual([1, 1, 1]);
  });
});

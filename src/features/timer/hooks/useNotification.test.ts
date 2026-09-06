import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSettingsStore } from "../../settings/store";
import type { DisplayLanguage } from "../../../shared/i18n/routing";
import { useNotification } from "./useNotification";

interface MockAudio {
  load: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  paused: boolean;
  currentTime: number;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

describe("useNotification", () => {
  const audioByPath = new Map<string, MockAudio>();

  beforeEach(() => {
    audioByPath.clear();
    class AudioStub implements MockAudio {
      load = vi.fn();
      pause = vi.fn();
      play = vi.fn(() => Promise.resolve());
      paused = false;
      currentTime = 0;
      addEventListener = vi.fn();
      removeEventListener = vi.fn();

      constructor(path: string) {
        audioByPath.set(path, this);
      }
    }
    vi.stubGlobal("Audio", AudioStub);
    useSettingsStore.setState({ voice: "female", notifyMode: "sound" });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uses first only at startup and the URL language for the next message", async () => {
    const { result, rerender } = renderHook(
      ({ language }: { language: DisplayLanguage }) => useNotification(language),
      { initialProps: { language: "ja" } },
    );
    const japaneseFirst = audioByPath.get("/assets/audio/ja-female-first-step.wav")!;

    act(() => result.current.playFirstSound());
    await waitFor(() => expect(japaneseFirst.play).toHaveBeenCalledOnce());

    rerender({ language: "en" });
    expect(japaneseFirst.pause).not.toHaveBeenCalled();

    const englishNext = audioByPath.get("/assets/audio/en-female-next-step.wav")!;
    act(() => result.current.playSound(false));
    await waitFor(() => expect(englishNext.play).toHaveBeenCalledOnce());
  });
});

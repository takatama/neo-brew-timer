import { StrictMode, useEffect, useRef } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSettingsStore } from "../../settings/store";
import type { DisplayLanguage } from "../../../shared/i18n/routing";
import { useNotification } from "./useNotification";
import { clearVoiceAudio } from "./voiceAudio";

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
    clearVoiceAudio();
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

  afterEach(() => {
    clearVoiceAudio();
    vi.unstubAllGlobals();
  });

  it("uses first only at startup and the URL language for the next message", async () => {
    const { result, rerender } = renderHook(
      ({ language }: { language: DisplayLanguage }) =>
        useNotification(language),
      { initialProps: { language: "ja" } },
    );
    const japaneseFirst = audioByPath.get(
      "/assets/audio/ja-female-first-step.wav",
    )!;

    act(() => result.current.playFirstSound());
    await waitFor(() => expect(japaneseFirst.play).toHaveBeenCalledOnce());

    rerender({ language: "en" });
    expect(japaneseFirst.pause).not.toHaveBeenCalled();

    const englishNext = audioByPath.get(
      "/assets/audio/en-female-next-step.wav",
    )!;
    act(() => result.current.playSound(false));
    await waitFor(() => expect(englishNext.play).toHaveBeenCalledOnce());
  });
  it("does not stop the first cue during StrictMode effect replay, but stops on real unmount", async () => {
    const { unmount } = renderHook(
      () => {
        const notification = useNotification("ja");
        const started = useRef(false);
        useEffect(() => {
          if (!started.current) {
            started.current = true;
            notification.playFirstSound();
          }
        }, [notification.playFirstSound]);
        return notification;
      },
      { wrapper: StrictMode },
    );
    await act(async () => {
      await Promise.resolve();
    });
    const first = audioByPath.get("/assets/audio/ja-female-first-step.wav")!;
    expect(first.play).toHaveBeenCalledOnce();
    expect(first.pause).not.toHaveBeenCalled();
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(first.pause).toHaveBeenCalledOnce();
  });

  it("muting stops an active cue immediately", async () => {
    const { result } = renderHook(() => useNotification("ja"));
    act(() => result.current.playFirstSound());
    await act(async () => {
      await Promise.resolve();
    });
    const first = audioByPath.get("/assets/audio/ja-female-first-step.wav")!;
    act(() => useSettingsStore.getState().toggleNotifyFlag("sound"));
    expect(first.pause).toHaveBeenCalledOnce();
  });

  it("reports denied playback while treating cancellation as an intentional stop", async () => {
    const { result } = renderHook(() => useNotification("ja"));
    const next = audioByPath.get("/assets/audio/ja-female-next-step.wav")!;
    next.play.mockRejectedValueOnce(new DOMException("canceled", "AbortError"));
    act(() => result.current.playSound(false));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.audioBlocked).toBe(false);
    next.play.mockRejectedValueOnce(
      new DOMException("denied", "NotAllowedError"),
    );
    act(() => result.current.playSound(false));
    await waitFor(() => expect(result.current.audioBlocked).toBe(true));
  });
});

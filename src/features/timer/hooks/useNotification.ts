import { useCallback, useEffect, useRef } from "react";
import { useSettingsStore } from "../../settings/store";

export const VOICE_NOTIFICATION_EVENT = "coco:voice-notification";
export const VOICE_NOTIFICATION_END_EVENT = "coco:voice-notification-end";

type VoiceMessage = "first" | "next" | "done";

function loadAudio(
  language: string,
  voice: string,
): Record<VoiceMessage, HTMLAudioElement> {
  const suffixes: Record<VoiceMessage, string> = {
    first: "first-step",
    next: "next-step",
    done: "finish",
  };
  return Object.fromEntries(
    Object.entries(suffixes).map(([type, suffix]) => {
      const audio = new Audio(`/assets/audio/${language}-${voice}-${suffix}.wav`);
      audio.load();
      return [type, audio];
    }),
  ) as Record<VoiceMessage, HTMLAudioElement>;
}

export function useNotification() {
  const audioRef = useRef<Record<VoiceMessage, HTMLAudioElement> | null>(null);

  useEffect(() => {
    const { language, voice } = useSettingsStore.getState();
    audioRef.current = loadAudio(language, voice);

    const unsubscribe = useSettingsStore.subscribe((state, prev) => {
      if (state.language !== prev.language || state.voice !== prev.voice) {
        Object.values(audioRef.current ?? {}).forEach((audio) => audio.pause());
        audioRef.current = loadAudio(state.language, state.voice);
      }
    });

    return () => {
      unsubscribe();
      Object.values(audioRef.current ?? {}).forEach((audio) => audio.pause());
    };
  }, []);

  const playVoiceMessage = useCallback((type: VoiceMessage) => {
    if (!useSettingsStore.getState().isSoundEnabled()) return;
    const audio = audioRef.current?.[type];
    if (!audio) return;

    let isStarted = false;
    let isCompleted = false;

    const handleStarted = () => {
      if (isStarted) {
        return;
      }

      isStarted = true;
      window.dispatchEvent(new CustomEvent(VOICE_NOTIFICATION_EVENT));
    };

    const handleCompleted = () => {
      if (isCompleted) {
        return;
      }

      isCompleted = true;
      audio.removeEventListener("playing", handleStarted);
      audio.removeEventListener("ended", handleCompleted);
      audio.removeEventListener("pause", handleCompleted);
      window.dispatchEvent(new CustomEvent(VOICE_NOTIFICATION_END_EVENT));
    };

    audio.addEventListener("playing", handleStarted);
    audio.addEventListener("ended", handleCompleted);
    audio.addEventListener("pause", handleCompleted);
    audio.currentTime = 0;

    audio.play()
      .then(() => {
        // Some browsers dispatch `playing` immediately, but if it already started before
        // the event callback runs we still guarantee a single start notification.
        if (!isStarted && !audio.paused) {
          handleStarted();
        }
      })
      .catch(() => {
        handleCompleted();
      });
  }, []);

  const playSound = useCallback(
    (isFinish: boolean) => playVoiceMessage(isFinish ? "done" : "next"),
    [playVoiceMessage],
  );

  const playFirstSound = useCallback(
    () => playVoiceMessage("first"),
    [playVoiceMessage],
  );

  const vibrate = useCallback((type: "pre-step" | "step-change") => {
    if (!useSettingsStore.getState().isVibrateEnabled()) return;
    if (!navigator.vibrate) return;
    if (type === "pre-step") {
      navigator.vibrate(180);
    } else {
      navigator.vibrate([140, 80, 140]);
    }
  }, []);

  return { playSound, playFirstSound, vibrate };
}

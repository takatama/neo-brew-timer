import { useCallback, useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../../settings/store";
import type { DisplayLanguage } from "../../../shared/i18n/routing";
import {
  getVoiceAudio,
  prepareVoiceCue,
  stopVoiceAudio,
  type VoiceMessage,
} from "./voiceAudio";
export function useNotification(language: DisplayLanguage) {
  const voice = useSettingsStore((state) => state.voice);
  const lifecycle = useRef(0);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const stop = useCallback(() => {
    stopVoiceAudio();
    navigator.vibrate?.(0);
  }, []);
  useEffect(() => {
    getVoiceAudio(language, voice);
  }, [language, voice]);
  useEffect(() => {
    const generation = ++lifecycle.current;
    const unsubscribe = useSettingsStore.subscribe((state) => {
      if (!state.isSoundEnabled()) stopVoiceAudio();
    });
    return () => {
      unsubscribe();
      // StrictMode recreates effects in the same turn. Do not cancel that first cue.
      queueMicrotask(() => {
        if (lifecycle.current === generation) stop();
      });
    };
  }, [stop]);
  const playVoiceMessage = useCallback(
    (type: VoiceMessage) => {
      if (!useSettingsStore.getState().isSoundEnabled()) return;
      const audio = getVoiceAudio(language, voice)[type];
      prepareVoiceCue(audio);
      void audio
        .play()
        .then(() => setAudioBlocked(false))
        .catch((error: unknown) => {
          // Pause/cancel interrupts pending play() by design; only report actual denial.
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          setAudioBlocked(true);
        });
    },
    [language, voice],
  );
  const playSound = useCallback(
    (finish: boolean) => playVoiceMessage(finish ? "done" : "next"),
    [playVoiceMessage],
  );
  const playFirstSound = useCallback(
    () => playVoiceMessage("first"),
    [playVoiceMessage],
  );
  const vibrate = useCallback((type: "pre-step" | "step-change") => {
    if (!useSettingsStore.getState().isVibrateEnabled()) return;
    navigator.vibrate?.(type === "pre-step" ? 180 : [140, 80, 140]);
  }, []);
  return { playSound, playFirstSound, vibrate, stop, audioBlocked };
}

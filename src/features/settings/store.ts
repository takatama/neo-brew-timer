import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language, NotifyMode, Settings, Voice } from "./types";
function defaultLanguage(): Language {
  return typeof navigator !== "undefined" && navigator.language.startsWith("ja")
    ? "ja"
    : "en";
}
function normalizeNotifyMode(mode: unknown): NotifyMode {
  return mode === "both" ||
    mode === "sound" ||
    mode === "vibrate" ||
    mode === "none"
    ? mode
    : "both";
}
export interface SettingsStore extends Settings {
  setLanguage: (language: Language) => void;
  setNotifyMode: (mode: NotifyMode) => void;
  toggleNotifyFlag: (flag: "sound" | "vibrate") => void;
  setVoice: (voice: Voice) => void;
  setDebugEnabled: (enabled: boolean) => void;
  setDebugSpeed: (speed: number) => void;
  setStartDelay: (enabled: boolean) => void;
  isSoundEnabled: () => boolean;
  isVibrateEnabled: () => boolean;
}
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      language: defaultLanguage(),
      notifyMode: "both",
      voice: "male",
      startDelay: true,
      debugEnabled: false,
      debugSpeed: 1,
      setLanguage: (language) => set({ language }),
      setNotifyMode: (notifyMode) => set({ notifyMode }),
      toggleNotifyFlag: (flag) => {
        const flags = {
          sound: get().isSoundEnabled(),
          vibrate: get().isVibrateEnabled(),
        };
        flags[flag] = !flags[flag];
        set({
          notifyMode: flags.sound
            ? flags.vibrate
              ? "both"
              : "sound"
            : flags.vibrate
              ? "vibrate"
              : "none",
        });
      },
      setVoice: (voice) => set({ voice }),
      setStartDelay: (startDelay) => set({ startDelay }),
      setDebugEnabled: (debugEnabled) =>
        set({ debugEnabled, debugSpeed: debugEnabled ? 5 : 1 }),
      setDebugSpeed: (speed) => set({ debugSpeed: speed === 5 ? 5 : 1 }),
      isSoundEnabled: () =>
        get().notifyMode === "sound" || get().notifyMode === "both",
      isVibrateEnabled: () =>
        get().notifyMode === "vibrate" || get().notifyMode === "both",
    }),
    {
      name: "coco-timer-settings",
      version: 7,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return localStorage.getItem(name);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value);
          } catch {
            /* Preferences are optional. */
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            /* Preferences are optional. */
          }
        },
      })),
      migrate: (saved) => {
        const state = (saved ?? {}) as Partial<Settings>;
        return {
          language:
            state.language === "ja" || state.language === "en"
              ? state.language
              : defaultLanguage(),
          notifyMode: normalizeNotifyMode(state.notifyMode),
          voice: state.voice === "female" ? "female" : "male",
          startDelay: state.startDelay ?? true,
          debugEnabled: false,
          debugSpeed: 1,
        };
      },
      partialize: (state) => ({
        language: state.language,
        notifyMode: state.notifyMode,
        voice: state.voice,
        startDelay: state.startDelay,
      }),
    },
  ),
);

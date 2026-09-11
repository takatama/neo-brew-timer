import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BgmDayOfWeek, Language, NotifyMode, Settings, Voice } from "./types";

function getDefaultLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.startsWith("ja") ? "ja" : "en";
}

const DAY_OF_WEEK_BY_JS_DAY: BgmDayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function getDefaultDebugBgmDayOfWeek(): BgmDayOfWeek {
  const jsDay = new Date().getDay();
  return DAY_OF_WEEK_BY_JS_DAY[jsDay] ?? "mon";
}

function normalizeDebugBgmDayOfWeek(dayOfWeek: unknown): BgmDayOfWeek {
  return dayOfWeek === "sun"
    || dayOfWeek === "mon"
    || dayOfWeek === "tue"
    || dayOfWeek === "wed"
    || dayOfWeek === "thu"
    || dayOfWeek === "fri"
    || dayOfWeek === "sat"
    ? dayOfWeek
    : "mon";
}

function normalizeNotifyMode(mode: string | undefined): NotifyMode {
  if (mode === "both" || mode === "sound" || mode === "vibrate" || mode === "none") {
    return mode;
  }
  return "both";
}

export interface SettingsStore extends Settings {
  setLanguage: (lang: Language) => void;
  setNotifyMode: (mode: NotifyMode) => void;
  toggleNotifyFlag: (flag: "sound" | "vibrate") => void;
  setVoice: (voice: Voice) => void;
  setDebugEnabled: (enabled: boolean) => void;
  setDebugSpeed: (speed: number) => void;
  setStartDelay: (enabled: boolean) => void;
  setBgmEnabled: (enabled: boolean) => void;
  setDebugBgmDayOfWeek: (dayOfWeek: BgmDayOfWeek) => void;
  isSoundEnabled: () => boolean;
  isVibrateEnabled: () => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      language: getDefaultLanguage(),
      notifyMode: "both" as NotifyMode,
      voice: "male" as Voice,
      debugEnabled: false,
      debugSpeed: 1,
      startDelay: true,
      bgmEnabled: false,
      debugBgmDayOfWeek: getDefaultDebugBgmDayOfWeek(),

      setLanguage: (language) => set({ language }),
      setNotifyMode: (notifyMode) => set({ notifyMode }),

      toggleNotifyFlag: (flag) => {
        const { notifyMode } = get();
        const flags = {
          sound: notifyMode === "sound" || notifyMode === "both",
          vibrate: notifyMode === "vibrate" || notifyMode === "both",
        };
        flags[flag] = !flags[flag];

        let newMode: NotifyMode;
        if (flags.sound && flags.vibrate) newMode = "both";
        else if (flags.sound) newMode = "sound";
        else if (flags.vibrate) newMode = "vibrate";
        else newMode = "none";

        set({ notifyMode: newMode });
      },

      setVoice: (voice) => set({ voice }),
      setDebugEnabled: (debugEnabled) =>
        set({
          debugEnabled,
          debugSpeed: debugEnabled ? 5 : 1,
        }),
      setDebugSpeed: (debugSpeed) =>
        set({
          debugSpeed: debugSpeed === 5 ? 5 : 1,
        }),
      setStartDelay: (startDelay) => set({ startDelay }),
      setBgmEnabled: (bgmEnabled) => set({ bgmEnabled }),
      setDebugBgmDayOfWeek: (debugBgmDayOfWeek) => set({
        debugBgmDayOfWeek: normalizeDebugBgmDayOfWeek(debugBgmDayOfWeek),
      }),

      isSoundEnabled: () => {
        const mode = get().notifyMode;
        return mode === "sound" || mode === "both";
      },
      isVibrateEnabled: () => {
        const mode = get().notifyMode;
        return mode === "vibrate" || mode === "both";
      },
    }),
    {
      name: "coco-timer-settings",
      version: 6,
      migrate: (persistedState: unknown) => {
        const state = (persistedState ?? {}) as Partial<Settings>;
        const debugSpeed = state.debugSpeed === 5 ? 5 : 1;
        return {
          language: state.language ?? getDefaultLanguage(),
          notifyMode: normalizeNotifyMode(state.notifyMode),
          voice: state.voice ?? "male",
          startDelay: state.startDelay ?? true,
          debugSpeed,
          debugEnabled: state.debugEnabled ?? debugSpeed > 1,
          bgmEnabled: state.bgmEnabled ?? false,
          debugBgmDayOfWeek: state.debugBgmDayOfWeek == null
            ? getDefaultDebugBgmDayOfWeek()
            : normalizeDebugBgmDayOfWeek(state.debugBgmDayOfWeek),
        };
      },
      partialize: (state) => ({
        language: state.language,
        notifyMode: normalizeNotifyMode(state.notifyMode),
        voice: state.voice,
        debugEnabled: state.debugEnabled,
        debugSpeed: state.debugSpeed,
        startDelay: state.startDelay,
        bgmEnabled: state.bgmEnabled,
        debugBgmDayOfWeek: normalizeDebugBgmDayOfWeek(state.debugBgmDayOfWeek),
      }),
    },
  ),
);

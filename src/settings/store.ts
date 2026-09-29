import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_BEANS, clampBeans } from "../brew/recipe";

export type Language = "ja" | "en";
export type CueSound = "voice" | "chime" | "off";
export type Voice = "male" | "female";

export interface Settings {
  language: Language | null;
  /** How the five-second lead-in sounds. */
  sound: CueSound;
  /** The audible sound to return to when the quick mute is turned off. */
  lastSound: Exclude<CueSound, "off">;
  voice: Voice;
  vibrate: boolean;
  countdown: boolean;
  music: boolean;
  /** Developer: brew time runs this many times faster. */
  speed: 1 | 5;
}

export interface SettingsStore extends Settings {
  setLanguage: (language: Language) => void;
  setSound: (sound: CueSound) => void;
  toggleMute: () => void;
  setVoice: (voice: Voice) => void;
  setVibrate: (vibrate: boolean) => void;
  setCountdown: (countdown: boolean) => void;
  setMusic: (music: boolean) => void;
  setSpeed: (speed: 1 | 5) => void;
}

export const DEFAULT_SETTINGS: Settings = {
  language: null,
  sound: "voice",
  lastSound: "voice",
  voice: "male",
  vibrate: true,
  countdown: true,
  music: false,
  speed: 1,
};

/** The settings key predates this app's current name; keep it so preferences survive. */
export const SETTINGS_KEY = "coco-timer-settings";

const safeStorage = createJSONStorage(() => {
  try {
    const probe = "__neo_probe__";
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
      removeItem: (key: string) => void memory.delete(key),
    };
  }
});

/** Accepts any earlier saved shape and returns valid current settings. */
export function migrateSettings(persisted: unknown): Settings {
  const s = (persisted && typeof persisted === "object" ? persisted : {}) as Record<string, unknown>;
  const pick = <T,>(value: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;

  let sound: CueSound = pick(s.sound, ["voice", "chime", "off"] as const, DEFAULT_SETTINGS.sound);
  let vibrate = typeof s.vibrate === "boolean" ? s.vibrate : DEFAULT_SETTINGS.vibrate;
  if (s.sound === undefined && typeof s.notifyMode === "string") {
    // v6 stored one combined "notifyMode".
    const mode = s.notifyMode;
    sound = mode === "both" || mode === "sound" ? "voice" : "off";
    vibrate = mode === "both" || mode === "vibrate";
  }

  const legacySpeed = s.debugSpeed === 5 && s.debugEnabled !== false ? 5 : 1;
  return {
    language: pick(s.language, ["ja", "en"] as const, null as Language | null),
    sound,
    lastSound: pick(s.lastSound, ["voice", "chime"] as const, sound === "chime" ? "chime" : "voice"),
    voice: pick(s.voice, ["male", "female"] as const, DEFAULT_SETTINGS.voice),
    vibrate,
    countdown: typeof s.countdown === "boolean"
      ? s.countdown
      : typeof s.startDelay === "boolean" ? s.startDelay : DEFAULT_SETTINGS.countdown,
    music: typeof s.music === "boolean"
      ? s.music
      : typeof s.bgmEnabled === "boolean" ? s.bgmEnabled : DEFAULT_SETTINGS.music,
    speed: s.speed === 5 ? 5 : s.speed === 1 ? 1 : legacySpeed,
  };
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      setLanguage: (language) => set({ language }),
      setSound: (sound) => set(sound === "off" ? { sound } : { sound, lastSound: sound }),
      toggleMute: () => {
        const { sound, lastSound } = get();
        set(sound === "off" ? { sound: lastSound } : { sound: "off", lastSound: sound });
      },
      setVoice: (voice) => set({ voice }),
      setVibrate: (vibrate) => set({ vibrate }),
      setCountdown: (countdown) => set({ countdown }),
      setMusic: (music) => set({ music }),
      setSpeed: (speed) => set({ speed }),
    }),
    {
      name: SETTINGS_KEY,
      version: 7,
      storage: safeStorage,
      migrate: (persisted) => migrateSettings(persisted),
      merge: (persisted, current) => ({ ...current, ...migrateSettings(persisted) }),
      partialize: (state): Settings => ({
        language: state.language,
        sound: state.sound,
        lastSound: state.lastSound,
        voice: state.voice,
        vibrate: state.vibrate,
        countdown: state.countdown,
        music: state.music,
        speed: state.speed,
      }),
    },
  ),
);

/* ---------- Bean amount: remembered on this device, separately ---------- */

const BEANS_KEY = "neo-brew-beans";

function loadBeans(): number {
  try {
    const saved = localStorage.getItem(BEANS_KEY);
    return saved === null ? DEFAULT_BEANS : clampBeans(Number(saved));
  } catch {
    return DEFAULT_BEANS;
  }
}

interface BeansStore {
  beans: number;
  setBeans: (beans: number) => void;
}

export const useBeans = create<BeansStore>((set) => ({
  beans: loadBeans(),
  setBeans: (value) => {
    const beans = clampBeans(value);
    try {
      localStorage.setItem(BEANS_KEY, String(beans));
    } catch {
      // Storage is optional; the amount still applies to this visit.
    }
    set({ beans });
  },
}));

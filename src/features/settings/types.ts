export type Language = "ja" | "en";
export type NotifyMode = "both" | "sound" | "vibrate" | "none";
export type Voice = "male" | "female";
export type BgmDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface Settings {
  language: Language;
  notifyMode: NotifyMode;
  voice: Voice;
  debugEnabled: boolean;
  debugSpeed: number;
  startDelay: boolean;
  bgmEnabled: boolean;
  debugBgmDayOfWeek: BgmDayOfWeek;
}

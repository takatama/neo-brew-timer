import type { Cue } from "../brew/engine";
import type { Language } from "../settings/store";
import { useSettings } from "../settings/store";
import { duck } from "../music/player";
import { ClipPlayer, type Clip, type ClipUrls } from "./clips";
import { loadChimes } from "./chime";

/**
 * Turns engine cues into sound and vibration according to the user's settings.
 * All guidance is also on screen; sound and vibration are never required.
 */
const VOICE_SUFFIX: Record<Clip, string> = { first: "first-step", next: "next-step", done: "finish" };

function voiceUrls(language: Language, voice: "male" | "female"): ClipUrls {
  const url = (clip: Clip) => `/assets/audio/${language}-${voice}-${VOICE_SUFFIX[clip]}.wav`;
  return { first: url("first"), next: url("next"), done: url("done") };
}

const VIBRATE_APPROACH = 60;
const VIBRATE_STEP = [140, 80, 140];
const VIBRATE_DONE = [120, 70, 120, 70, 260];

export const canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export class Cues {
  private player = new ClipPlayer();
  private chimes: ClipUrls | null = null;

  constructor(private language: () => Language) {
    this.player.onPlaying((playing) => duck(playing));
  }

  private source(): { key: string; urls: ClipUrls } | null {
    const { sound, voice } = useSettings.getState();
    if (sound === "off") return null;
    if (sound === "chime") {
      if (this.chimes) return { key: "chime", urls: this.chimes };
      void this.warm();
    }
    const language = this.language();
    return { key: `voice:${language}:${voice}`, urls: voiceUrls(language, voice) };
  }

  /** Prepare whatever the current settings will play. Safe to call often. */
  async warm(): Promise<void> {
    if (useSettings.getState().sound === "chime" && !this.chimes) {
      this.chimes = await loadChimes();
    }
    const source = this.source();
    if (source) this.player.preload(source.key, source.urls);
  }

  /** Must be called synchronously inside a user gesture (iOS). */
  unlock(): void {
    const source = this.source();
    if (source) this.player.unlock(source.key, source.urls);
  }

  handle(cue: Cue): void {
    switch (cue.type) {
      case "countdown":
        this.play("first", cue.offsetMs);
        if (cue.offsetMs < 300) this.vibrate(VIBRATE_APPROACH);
        break;
      case "approach":
        this.play(cue.isFinish ? "done" : "next", cue.offsetMs);
        if (cue.offsetMs < 300) this.vibrate(VIBRATE_APPROACH);
        break;
      case "step":
        this.vibrate(cue.isFinish ? VIBRATE_DONE : VIBRATE_STEP);
        break;
      case "hush":
        this.player.stop();
        if (canVibrate) navigator.vibrate(0);
        break;
    }
  }

  /** Let people hear their choice from Settings. */
  sample(): void {
    this.unlock();
    this.play("next", 2000);
  }

  stop(): void {
    this.player.stop();
  }

  private play(clip: Clip, offsetMs: number) {
    const source = this.source();
    if (!source) return;
    this.player.play(source.key, source.urls, clip, offsetMs / 1000);
  }

  private vibrate(pattern: number | number[]) {
    if (!canVibrate || !useSettings.getState().vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration can be blocked without a recent gesture; guidance stays on screen.
    }
  }
}

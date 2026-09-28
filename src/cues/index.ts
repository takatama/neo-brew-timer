import type { Cue } from "../brew/engine";
import type { Language, Voice } from "../settings/store";
import { useSettings } from "../settings/store";
import { duck } from "../music/player";
import { CLIPS, ClipPlayer, type Clip, type ClipUrls } from "./clips";
import { loadChimes } from "./chime";

/**
 * Turns engine cues into sound and vibration according to the user's settings.
 * All guidance is also on screen; sound and vibration are never required.
 */
const VOICE_SUFFIX: Record<Clip, string> = { first: "first-step", next: "next-step", done: "finish" };

function voiceUrls(language: Language, voice: Voice): ClipUrls {
  const url = (clip: Clip) => `/assets/audio/${language}-${voice}-${VOICE_SUFFIX[clip]}.wav`;
  return { first: url("first"), next: url("next"), done: url("done") };
}

/**
 * Reads the clips into memory and returns blob: URLs. A resumed lead-in must
 * start mid-clip, and media served by the offline cache (or any server without
 * range requests) cannot seek; in-memory blobs always can.
 */
async function loadIntoMemory(urls: ClipUrls): Promise<ClipUrls> {
  const entries = await Promise.all(CLIPS.map(async (clip) => {
    const response = await fetch(urls[clip]);
    if (!response.ok) throw new Error(`Could not load ${urls[clip]}`);
    return [clip, URL.createObjectURL(await response.blob())] as const;
  }));
  return Object.fromEntries(entries) as ClipUrls;
}

const VIBRATE_APPROACH = 60;
const VIBRATE_STEP = [140, 80, 140];
const VIBRATE_DONE = [120, 70, 120, 70, 260];

export const canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

export class Cues {
  private player = new ClipPlayer();
  private chimes: ClipUrls | null = null;
  private voices = new Map<string, ClipUrls>();
  private loading = new Map<string, Promise<void>>();

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
    const id = `${language}:${voice}`;
    const inMemory = this.voices.get(id);
    if (inMemory) return { key: `voice:${id}`, urls: inMemory };
    // Not loaded yet: play straight from the network so nothing is missed.
    void this.loadVoice(language, voice);
    return { key: `voice-direct:${id}`, urls: voiceUrls(language, voice) };
  }

  private loadVoice(language: Language, voice: Voice): Promise<void> {
    const id = `${language}:${voice}`;
    if (this.voices.has(id)) return Promise.resolve();
    let pending = this.loading.get(id);
    if (!pending) {
      pending = loadIntoMemory(voiceUrls(language, voice))
        .then((urls) => void this.voices.set(id, urls))
        .catch(() => undefined)
        .finally(() => this.loading.delete(id));
      this.loading.set(id, pending);
    }
    return pending;
  }

  /** Prepare whatever the current settings will play. Safe to call often. */
  async warm(): Promise<void> {
    const { sound, voice } = useSettings.getState();
    if (sound === "chime" && !this.chimes) this.chimes = await loadChimes();
    if (sound === "voice") await this.loadVoice(this.language(), voice);
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

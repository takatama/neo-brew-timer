/**
 * Plays five-second lead-in clips: "5, 4, 3, 2, 1" followed by a message or
 * chime that lands exactly on the step boundary. Starting a clip `offset`
 * seconds in keeps it in sync after a pause or a late tick.
 *
 * <audio> elements are used rather than Web Audio because iOS plays them even
 * with the ringer switch on silent. iOS only allows play() on an element that
 * was first played during a user gesture, so `unlock()` must run inside a tap.
 */
export type Clip = "first" | "next" | "done";
export const CLIPS: readonly Clip[] = ["first", "next", "done"];

export type ClipUrls = Record<Clip, string>;

type Listener = (playing: boolean) => void;

export class ClipPlayer {
  private sets = new Map<string, Record<Clip, HTMLAudioElement>>();
  private unlocked = new WeakSet<HTMLAudioElement>();
  private current: HTMLAudioElement | null = null;
  private listeners = new Set<Listener>();

  private elements(key: string, urls: ClipUrls): Record<Clip, HTMLAudioElement> {
    let set = this.sets.get(key);
    if (!set) {
      const make = (clip: Clip) => {
        const audio = new Audio(urls[clip]);
        audio.preload = "auto";
        const end = () => this.finished(audio);
        audio.addEventListener("ended", end);
        audio.addEventListener("pause", end);
        return audio;
      };
      set = { first: make("first"), next: make("next"), done: make("done") };
      this.sets.set(key, set);
    }
    return set;
  }

  preload(key: string, urls: ClipUrls): void {
    this.elements(key, urls);
  }

  /** Call from a user gesture: silently plays and rewinds each clip once. */
  unlock(key: string, urls: ClipUrls): void {
    const set = this.elements(key, urls);
    CLIPS.forEach((clip) => {
      const audio = set[clip];
      if (this.unlocked.has(audio) || this.current === audio) return;
      audio.muted = true;
      audio.play().then(() => {
        this.unlocked.add(audio);
        if (this.current === audio) return;
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }).catch(() => {
        audio.muted = false;
      });
    });
  }

  play(key: string, urls: ClipUrls, clip: Clip, offsetSec = 0): void {
    const audio = this.elements(key, urls)[clip];
    this.stop();
    if (Number.isFinite(audio.duration) && offsetSec >= audio.duration - 0.25) return;
    audio.muted = false;
    try {
      audio.currentTime = Math.max(0, offsetSec);
    } catch {
      // Seeking before metadata has loaded can throw in some browsers.
    }
    this.current = audio;
    this.emit(true);
    audio.play().then(() => this.unlocked.add(audio)).catch(() => this.finished(audio));
  }

  stop(): void {
    const audio = this.current;
    if (!audio) return;
    this.current = null;
    audio.pause();
    this.emit(false);
  }

  onPlaying(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private finished(audio: HTMLAudioElement) {
    if (this.current !== audio) return;
    this.current = null;
    this.emit(false);
  }

  private emit(playing: boolean) {
    this.listeners.forEach((listener) => listener(playing));
  }
}

/**
 * Plays five-second lead-in clips: "5, 4, 3, 2, 1" followed by a message or
 * chime that lands exactly on the step boundary. Starting a clip `offset`
 * seconds in keeps it in sync after a pause or a late tick.
 *
 * <audio> elements are used rather than Web Audio because iOS plays them even
 * with the ringer switch on silent. iOS only allows play() on an element that
 * has once been played during a user gesture, and that permission stays with
 * the element when its source changes. So the player keeps exactly one
 * element per clip ("first", "next", "done"), unlocks all three in the tap
 * that starts a brew, and afterwards only swaps their sources (voice ↔ chime,
 * one language ↔ another).
 */
export type Clip = "first" | "next" | "done";
export const CLIPS: readonly Clip[] = ["first", "next", "done"];

export type ClipUrls = Record<Clip, string>;

type Listener = (playing: boolean) => void;

const HAVE_METADATA = 1;

/** Seek now if the clip's length is known, otherwise as soon as it is. */
function seekTo(audio: HTMLAudioElement, seconds: number): void {
  const apply = () => {
    try {
      audio.currentTime = seconds;
    } catch {
      // Some browsers throw while metadata is still loading; retried below.
    }
  };
  if (audio.readyState >= HAVE_METADATA) apply();
  else audio.addEventListener("loadedmetadata", apply, { once: true });
}

export class ClipPlayer {
  private pool = new Map<Clip, HTMLAudioElement>();
  private sources = new WeakMap<HTMLAudioElement, string>();
  private unlocked = new WeakSet<HTMLAudioElement>();
  private current: HTMLAudioElement | null = null;
  private listeners = new Set<Listener>();

  private element(clip: Clip): HTMLAudioElement {
    let audio = this.pool.get(clip);
    if (!audio) {
      const created = new Audio();
      created.preload = "auto";
      const end = () => this.finished(created);
      created.addEventListener("ended", end);
      created.addEventListener("pause", end);
      this.pool.set(clip, created);
      audio = created;
    }
    return audio;
  }

  /** The element for `clip`, pointed at `url` unless it is playing right now. */
  private load(clip: Clip, url: string): HTMLAudioElement {
    const audio = this.element(clip);
    if (this.sources.get(audio) !== url && audio !== this.current) {
      this.sources.set(audio, url);
      audio.src = url;
    }
    return audio;
  }

  preload(urls: ClipUrls): void {
    CLIPS.forEach((clip) => this.load(clip, urls[clip]));
  }

  /**
   * Call from a user gesture: silently plays and rewinds each element once.
   * Any source will do; the permission outlives later source changes.
   */
  unlock(urls: ClipUrls): void {
    CLIPS.forEach((clip) => {
      const audio = this.load(clip, urls[clip]);
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

  play(urls: ClipUrls, clip: Clip, offsetSec = 0): void {
    this.stop();
    const audio = this.load(clip, urls[clip]);
    if (Number.isFinite(audio.duration) && offsetSec >= audio.duration - 0.25) return;
    audio.muted = false;
    seekTo(audio, Math.max(0, offsetSec));
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

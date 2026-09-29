import { create } from "zustand";
import { getAutoBgmDayOfWeek, getBgmTracksForDayOfWeek, type AudioTrack } from "./tracks";
import { getSavedBgmTrackIndex, setSavedBgmTrackIndex } from "./tracks/playbackProgress";

/**
 * Optional background music: today's playlist, continuing where the last
 * listen left off. Voice guidance ducks it (where the browser allows volume
 * control; iOS ignores element volume).
 */
const FULL_VOLUME = 1;
const DUCKED_VOLUME = 0.28;

interface MusicState {
  playing: boolean;
  loading: boolean;
  track: AudioTrack | null;
}

export const useMusic = create<MusicState>(() => ({ playing: false, loading: false, track: null }));

let audio: HTMLAudioElement | null = null;
let tracks: AudioTrack[] = [];
let index = 0;
let day = getAutoBgmDayOfWeek();

function ensureAudio(): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (audio) return audio;
  day = getAutoBgmDayOfWeek();
  tracks = getBgmTracksForDayOfWeek(day);
  index = tracks.length ? getSavedBgmTrackIndex(day) % tracks.length : 0;
  audio = new Audio();
  audio.preload = "none";
  audio.addEventListener("playing", () => {
    useMusic.setState({ playing: true, loading: false });
    setSavedBgmTrackIndex(day, (index + 1) % Math.max(1, tracks.length));
  });
  audio.addEventListener("waiting", () => useMusic.setState({ loading: true }));
  audio.addEventListener("pause", () => useMusic.setState({ playing: false, loading: false }));
  audio.addEventListener("ended", () => advance(true));
  audio.addEventListener("error", () => useMusic.setState({ playing: false, loading: false }));
  load(index);
  bindMediaSession();
  return audio;
}

function load(nextIndex: number) {
  const track = tracks[nextIndex];
  if (!audio || !track) return;
  index = nextIndex;
  audio.src = track.audioUrl;
  useMusic.setState({ track });
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: "Neo Brew Timer",
        artwork: [{ src: track.artworkUrl, sizes: "512x512", type: "image/webp" }],
      });
    } catch {
      // MediaMetadata is unavailable in some embedded browsers.
    }
  }
}

function advance(autoplay: boolean) {
  if (!tracks.length) return;
  load((index + 1) % tracks.length);
  if (autoplay) void play();
}

function bindMediaSession() {
  if (!("mediaSession" in navigator)) return;
  try {
    navigator.mediaSession.setActionHandler("play", () => void play());
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("nexttrack", () => advance(true));
  } catch {
    // Some handlers are unsupported; music still works from the app.
  }
}

export async function play(): Promise<void> {
  const element = ensureAudio();
  if (!element || !tracks.length) return;
  useMusic.setState({ loading: true });
  try {
    await element.play();
  } catch {
    useMusic.setState({ playing: false, loading: false });
  }
}

export function pause(): void {
  audio?.pause();
}

export function toggleMusic(): void {
  if (useMusic.getState().playing) pause();
  else void play();
}

export function duck(ducked: boolean): void {
  if (audio) audio.volume = ducked ? DUCKED_VOLUME : FULL_VOLUME;
}

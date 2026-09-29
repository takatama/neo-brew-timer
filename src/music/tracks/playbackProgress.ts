import type { BgmDayOfWeek } from "./types";

const STORAGE_KEY = "coco-timer-bgm-playback-progress";

type PlaybackProgress = Partial<Record<BgmDayOfWeek, number>>;

const normalizeTrackIndex = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const index = Math.trunc(value);
  return index >= 0 ? index : null;
};

const isBgmDayOfWeek = (value: unknown): value is BgmDayOfWeek => {
  return value === "sun"
    || value === "mon"
    || value === "tue"
    || value === "wed"
    || value === "thu"
    || value === "fri"
    || value === "sat";
};

const sanitizePlaybackProgress = (value: unknown): PlaybackProgress => {
  if (typeof value !== "object" || value == null) {
    return {};
  }

  const entries = Object.entries(value).filter(([dayOfWeek, trackIndex]) => {
    return isBgmDayOfWeek(dayOfWeek) && normalizeTrackIndex(trackIndex) != null;
  });

  return Object.fromEntries(
    entries.map(([dayOfWeek, trackIndex]) => [dayOfWeek, normalizeTrackIndex(trackIndex) as number]),
  ) as PlaybackProgress;
};

const readPlaybackProgress = (): PlaybackProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return sanitizePlaybackProgress(JSON.parse(raw));
  } catch {
    return {};
  }
};

const writePlaybackProgress = (value: PlaybackProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
};

export const getSavedBgmTrackIndex = (dayOfWeek: BgmDayOfWeek): number => {
  const progress = readPlaybackProgress();
  return progress[dayOfWeek] ?? 0;
};

export const setSavedBgmTrackIndex = (dayOfWeek: BgmDayOfWeek, trackIndex: number) => {
  const normalizedTrackIndex = normalizeTrackIndex(trackIndex);
  if (normalizedTrackIndex == null) {
    return;
  }

  const progress = readPlaybackProgress();
  progress[dayOfWeek] = normalizedTrackIndex;
  writePlaybackProgress(progress);
};

import { holidaySatClearTracks } from "./holiday/sat/clear";
import { holidaySunClearTracks } from "./holiday/sun/clear";
import { weekdayFriClearTracks } from "./weekday/fri/clear";
import { weekdayMonClearTracks } from "./weekday/mon/clear";
import { weekdayThuClearTracks } from "./weekday/thu/clear";
import { weekdayTueClearTracks } from "./weekday/tue/clear";
import { weekdayWedClearTracks } from "./weekday/wed/clear";
import type { AudioTrack, BgmContext, BgmDayOfWeek } from "./types";

export type { AudioTrack, BgmContext } from "./types";

const TRACKS_BY_CONTEXT_KEY: Record<string, AudioTrack[]> = {
  "weekday:mon:clear": weekdayMonClearTracks,
  "weekday:tue:clear": weekdayTueClearTracks,
  "weekday:wed:clear": weekdayWedClearTracks,
  "weekday:thu:clear": weekdayThuClearTracks,
  "weekday:fri:clear": weekdayFriClearTracks,
  "holiday:sat:clear": holidaySatClearTracks,
  "holiday:sun:clear": holidaySunClearTracks,
};

const DAY_OF_WEEK_BY_JS_DAY: BgmDayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const toContextKey = (context: BgmContext): string =>
  `${context.dayType}:${context.dayOfWeek}:${context.weather}`;

const getDayTypeFromDayOfWeek = (dayOfWeek: BgmDayOfWeek): BgmContext["dayType"] => {
  return dayOfWeek === "sat" || dayOfWeek === "sun" ? "holiday" : "weekday";
};

const normalizeBgmDayOfWeek = (dayOfWeek: unknown): BgmDayOfWeek => {
  return dayOfWeek === "sun"
    || dayOfWeek === "mon"
    || dayOfWeek === "tue"
    || dayOfWeek === "wed"
    || dayOfWeek === "thu"
    || dayOfWeek === "fri"
    || dayOfWeek === "sat"
    ? dayOfWeek
    : "mon";
};

export const getTracksForContext = (context: BgmContext): AudioTrack[] => {
  return TRACKS_BY_CONTEXT_KEY[toContextKey(context)] ?? weekdayMonClearTracks;
};

export const getBgmContextForDayOfWeek = (dayOfWeek: BgmDayOfWeek): BgmContext => {
  const normalizedDayOfWeek = normalizeBgmDayOfWeek(dayOfWeek);
  return {
    dayType: getDayTypeFromDayOfWeek(normalizedDayOfWeek),
    dayOfWeek: normalizedDayOfWeek,
    weather: "clear",
  };
};

export const getBgmTracksForDayOfWeek = (dayOfWeek: BgmDayOfWeek): AudioTrack[] => {
  return getTracksForContext(getBgmContextForDayOfWeek(dayOfWeek));
};

export const getAutoBgmDayOfWeek = (): BgmDayOfWeek => {
  const jsDay = new Date().getDay();
  return DAY_OF_WEEK_BY_JS_DAY[jsDay] ?? "mon";
};

export const getActiveBgmTracks = (params: {
  debugEnabled: boolean;
  debugDayOfWeek: BgmDayOfWeek;
}): AudioTrack[] => {
  const dayOfWeek = getActiveBgmDayOfWeek(params);
  return getBgmTracksForDayOfWeek(dayOfWeek);
};

export const getActiveBgmDayOfWeek = (params: {
  debugEnabled: boolean;
  debugDayOfWeek: BgmDayOfWeek;
}): BgmDayOfWeek => {
  return params.debugEnabled
    ? normalizeBgmDayOfWeek(params.debugDayOfWeek)
    : getAutoBgmDayOfWeek();
};

import { beforeEach, describe, expect, it } from "vitest";
import { getSavedBgmTrackIndex, setSavedBgmTrackIndex } from "./playbackProgress";

describe("bgm playback progress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to first track for unknown day", () => {
    expect(getSavedBgmTrackIndex("wed")).toBe(0);
  });

  it("stores and restores playback index per day", () => {
    setSavedBgmTrackIndex("wed", 3);
    setSavedBgmTrackIndex("thu", 7);

    expect(getSavedBgmTrackIndex("wed")).toBe(3);
    expect(getSavedBgmTrackIndex("thu")).toBe(7);
  });

  it("ignores invalid index writes", () => {
    setSavedBgmTrackIndex("fri", -1);
    setSavedBgmTrackIndex("fri", Number.NaN);

    expect(getSavedBgmTrackIndex("fri")).toBe(0);
  });
});

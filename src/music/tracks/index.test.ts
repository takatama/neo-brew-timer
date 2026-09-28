import { describe, expect, it } from "vitest";
import { getActiveBgmTracks, getBgmTracksForDayOfWeek } from "./index";

describe("bgm day-of-week normalization", () => {
  it("falls back to Monday tracks for unexpected day in debug resolver", () => {
    const tracks = getBgmTracksForDayOfWeek("invalid" as unknown as "mon");

    expect(tracks).toHaveLength(10);
    expect(tracks[0]?.id.startsWith("weekday_mon_clear_")).toBe(true);
  });

  it("falls back to Monday tracks when debugDayOfWeek is invalid", () => {
    const tracks = getActiveBgmTracks({
      debugEnabled: true,
      debugDayOfWeek: "invalid" as unknown as "mon",
    });

    expect(tracks).toHaveLength(10);
    expect(tracks[0]?.id.startsWith("weekday_mon_clear_")).toBe(true);
  });

  it("returns Sunday tracks when Sunday is selected in debug", () => {
    const tracks = getActiveBgmTracks({
      debugEnabled: true,
      debugDayOfWeek: "sun",
    });

    expect(tracks).toHaveLength(10);
    expect(tracks[0]?.id.startsWith("holiday_sun_clear_")).toBe(true);
  });
});

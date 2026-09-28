import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, migrateSettings, useSettings } from "./store";

describe("settings migration", () => {
  it("maps the previous combined notification mode", () => {
    expect(migrateSettings({ notifyMode: "both" })).toMatchObject({ sound: "voice", vibrate: true });
    expect(migrateSettings({ notifyMode: "sound" })).toMatchObject({ sound: "voice", vibrate: false });
    expect(migrateSettings({ notifyMode: "vibrate" })).toMatchObject({ sound: "off", vibrate: true });
    expect(migrateSettings({ notifyMode: "none" })).toMatchObject({ sound: "off", vibrate: false });
  });

  it("keeps language, voice, start delay, music and the developer speed", () => {
    expect(migrateSettings({
      language: "ja", voice: "female", startDelay: false, bgmEnabled: true, debugEnabled: true, debugSpeed: 5,
    })).toMatchObject({ language: "ja", voice: "female", countdown: false, music: true, speed: 5 });
    expect(migrateSettings({ debugEnabled: false, debugSpeed: 5 })).toMatchObject({ speed: 1 });
  });

  it("falls back to defaults for missing or invalid data", () => {
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(migrateSettings({ sound: "loud", voice: "robot", language: "fr", speed: 3 })).toEqual(DEFAULT_SETTINGS);
  });
});

describe("quick mute", () => {
  beforeEach(() => {
    useSettings.setState({ ...DEFAULT_SETTINGS });
  });

  it("returns to the sound that was playing before", () => {
    useSettings.getState().setSound("chime");
    useSettings.getState().toggleMute();
    expect(useSettings.getState().sound).toBe("off");
    useSettings.getState().toggleMute();
    expect(useSettings.getState().sound).toBe("chime");
  });

  it("persists to storage under the existing key", () => {
    useSettings.getState().setVoice("female");
    const saved = JSON.parse(localStorage.getItem("coco-timer-settings") ?? "{}");
    expect(saved.state.voice).toBe("female");
    expect(saved.version).toBe(7);
  });
});

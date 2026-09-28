import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClipPlayer, type ClipUrls } from "./clips";
import { Cues } from "./index";
import { DEFAULT_SETTINGS, useSettings } from "../settings/store";

/** A minimal stand-in for HTMLAudioElement that models metadata and seeking. */
class FakeAudio extends EventTarget {
  static all: FakeAudio[] = [];
  src: string;
  muted = false;
  preload = "";
  readyState = 0;
  duration = Number.NaN;
  paused = true;
  /** When false, behaves like media served without range requests. */
  seekable = true;
  private time = 0;
  playedFrom: number | null = null;

  constructor(src: string) {
    super();
    this.src = src;
    FakeAudio.all.push(this);
  }

  get currentTime() {
    return this.time;
  }

  set currentTime(value: number) {
    this.time = this.seekable && this.readyState >= 1 ? value : 0;
  }

  play() {
    this.paused = false;
    if (!this.muted) this.playedFrom = this.time;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  }

  loadMetadata(duration = 6) {
    this.readyState = 4;
    this.duration = duration;
    this.dispatchEvent(new Event("loadedmetadata"));
  }
}

const URLS: ClipUrls = { first: "/first.wav", next: "/next.wav", done: "/done.wav" };

beforeEach(() => {
  FakeAudio.all = [];
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("clip player", () => {
  it("starts a clip part-way when its length is known", () => {
    const player = new ClipPlayer();
    player.preload("k", URLS);
    const next = FakeAudio.all.find((a) => a.src === "/next.wav")!;
    next.loadMetadata();
    player.play("k", URLS, "next", 2.1);
    expect(next.playedFrom).toBe(2.1);
  });

  it("applies the offset once metadata arrives if it was not loaded yet", () => {
    const player = new ClipPlayer();
    player.play("k", URLS, "next", 1.8);
    const next = FakeAudio.all.find((a) => a.src === "/next.wav")!;
    expect(next.currentTime).toBe(0);
    next.loadMetadata();
    expect(next.currentTime).toBe(1.8);
  });

  it("skips a clip that would already be over, and stops the one playing", () => {
    const player = new ClipPlayer();
    player.preload("k", URLS);
    FakeAudio.all.forEach((a) => a.loadMetadata(6));
    player.play("k", URLS, "next", 1);
    const next = FakeAudio.all.find((a) => a.src === "/next.wav")!;
    player.play("k", URLS, "done", 5.9);
    expect(next.paused).toBe(true);
    expect(FakeAudio.all.find((a) => a.src === "/done.wav")!.playedFrom).toBeNull();
  });
});

describe("voice cues", () => {
  beforeEach(() => {
    useSettings.setState({ ...DEFAULT_SETTINGS, sound: "voice", voice: "female" });
    let n = 0;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new Blob(["wav"], { type: "audio/wav" }))));
    vi.stubGlobal("URL", Object.assign(Object.create(URL), { createObjectURL: () => `blob:clip-${(n += 1)}` }));
  });

  it("plays from memory once loaded, so a resumed countdown can start mid-way", async () => {
    const cues = new Cues(() => "ja");
    await cues.warm();
    expect(fetch).toHaveBeenCalledWith("/assets/audio/ja-female-next-step.wav");

    cues.handle({ type: "approach", stepIndex: 1, isFinish: false, offsetMs: 0 });
    const next = FakeAudio.all.find((a) => a.src.startsWith("blob:") && a.playedFrom !== null)!;
    next.loadMetadata();
    cues.handle({ type: "hush" });
    expect(next.paused).toBe(true);

    // Resuming two seconds into the lead-in continues from there.
    cues.handle({ type: "approach", stepIndex: 1, isFinish: false, offsetMs: 2000 });
    expect(next.playedFrom).toBe(2);
  });

  it("falls back to the network before clips are in memory", () => {
    const cues = new Cues(() => "en");
    cues.handle({ type: "countdown", offsetMs: 0 });
    const first = FakeAudio.all.find((a) => a.playedFrom !== null)!;
    expect(first.src).toBe("/assets/audio/en-female-first-step.wav");
  });

  it("plays nothing when cues are off", async () => {
    useSettings.setState({ sound: "off" });
    const cues = new Cues(() => "en");
    await cues.warm();
    cues.handle({ type: "approach", stepIndex: 1, isFinish: false, offsetMs: 0 });
    expect(FakeAudio.all.every((a) => a.playedFrom === null)).toBe(true);
  });
});

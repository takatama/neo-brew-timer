import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClipPlayer, type ClipUrls } from "./clips";
import { Cues } from "./index";
import { DEFAULT_SETTINGS, useSettings } from "../settings/store";

const chime = vi.hoisted(() => ({
  promise: null as Promise<Record<string, string> | null> | null,
}));
vi.mock("./chime", () => ({ loadChimes: () => chime.promise ?? Promise.resolve(null) }));

/**
 * A stand-in for HTMLAudioElement that models metadata, seeking and the iOS
 * rule: play() is refused unless it happens inside a user gesture or the
 * element has already been played in one (which survives source changes).
 */
class FakeAudio extends EventTarget {
  static all: FakeAudio[] = [];
  static inGesture = false;
  muted = false;
  preload = "";
  readyState = 0;
  duration = Number.NaN;
  paused = true;
  playedFrom: number | null = null;
  private allowed = false;
  private time = 0;
  private url = "";

  constructor(src = "") {
    super();
    this.url = src;
    FakeAudio.all.push(this);
  }

  get src() {
    return this.url;
  }

  set src(value: string) {
    this.url = value;
    this.readyState = 0;
    this.duration = Number.NaN;
    this.time = 0;
  }

  get currentTime() {
    return this.time;
  }

  set currentTime(value: number) {
    this.time = this.readyState >= 1 ? value : 0;
  }

  play() {
    if (FakeAudio.inGesture) this.allowed = true;
    if (!this.allowed) return Promise.reject(new DOMException("blocked", "NotAllowedError"));
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

const tap = (action: () => void) => {
  FakeAudio.inGesture = true;
  try {
    action();
  } finally {
    FakeAudio.inGesture = false;
  }
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const playing = () => FakeAudio.all.filter((a) => a.playedFrom !== null);

const A: ClipUrls = { first: "/a-first.wav", next: "/a-next.wav", done: "/a-done.wav" };
const B: ClipUrls = { first: "/b-first.wav", next: "/b-next.wav", done: "/b-done.wav" };

beforeEach(() => {
  FakeAudio.all = [];
  chime.promise = null;
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("clip player", () => {
  it("starts a clip part-way when its length is known", () => {
    const player = new ClipPlayer();
    player.preload(A);
    const next = FakeAudio.all.find((a) => a.src === A.next)!;
    next.loadMetadata();
    tap(() => player.play(A, "next", 2.1));
    expect(next.playedFrom).toBe(2.1);
  });

  it("applies the offset once metadata arrives if it was not loaded yet", () => {
    const player = new ClipPlayer();
    tap(() => player.play(A, "next", 1.8));
    const next = FakeAudio.all.find((a) => a.src === A.next)!;
    expect(next.currentTime).toBe(0);
    next.loadMetadata();
    expect(next.currentTime).toBe(1.8);
  });

  it("skips a clip that would already be over, and stops the one playing", () => {
    const player = new ClipPlayer();
    player.preload(A);
    FakeAudio.all.forEach((a) => a.loadMetadata(6));
    tap(() => player.play(A, "next", 1));
    const next = FakeAudio.all.find((a) => a.src === A.next)!;
    player.play(A, "done", 5.9);
    expect(next.paused).toBe(true);
    expect(FakeAudio.all.find((a) => a.src === A.done)!.playedFrom).toBeNull();
  });

  it("keeps one element per clip, so an unlock survives a change of source", async () => {
    const player = new ClipPlayer();
    tap(() => player.unlock(A));
    await flush();
    player.play(B, "next", 0);
    await flush();
    expect(FakeAudio.all).toHaveLength(3);
    expect(playing().map((a) => a.src)).toEqual([B.next]);
  });
});

describe("cues", () => {
  let blobs = 0;

  beforeEach(() => {
    blobs = 0;
    useSettings.setState({ ...DEFAULT_SETTINGS, sound: "voice", voice: "female" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new Blob(["wav"], { type: "audio/wav" }))));
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => `blob:clip-${(blobs += 1)}`;
  });

  it("plays voice from memory once loaded, so a resumed countdown starts mid-way", async () => {
    const cues = new Cues(() => "ja");
    await cues.warm();
    expect(fetch).toHaveBeenCalledWith("/assets/audio/ja-female-next-step.wav");
    tap(() => cues.unlock());
    await flush();

    cues.handle({ type: "approach", stepIndex: 1, isFinish: false, offsetMs: 0, fresh: true });
    const [next] = playing();
    expect(next.src.startsWith("blob:")).toBe(true);
    next.loadMetadata();
    cues.handle({ type: "hush" });
    expect(next.paused).toBe(true);

    cues.handle({ type: "approach", stepIndex: 1, isFinish: false, offsetMs: 2000, fresh: false });
    expect(next.playedFrom).toBe(2);
  });

  it("falls back to the network before clips are in memory", () => {
    const cues = new Cues(() => "en");
    tap(() => cues.handle({ type: "countdown", offsetMs: 0 }));
    expect(playing().map((a) => a.src)).toEqual(["/assets/audio/en-female-first-step.wav"]);
  });

  it("stays silent when off, yet unmuting later in the brew still plays", async () => {
    useSettings.setState({ sound: "off" });
    const cues = new Cues(() => "en");
    tap(() => cues.unlock()); // the tap that started the brew
    await flush();
    cues.handle({ type: "approach", stepIndex: 1, isFinish: false, offsetMs: 0, fresh: true });
    expect(playing()).toHaveLength(0);

    useSettings.setState({ sound: "voice" }); // e.g. from a state change without a gesture
    cues.handle({ type: "approach", stepIndex: 2, isFinish: false, offsetMs: 0, fresh: true });
    await flush();
    expect(playing()).toHaveLength(1);
  });

  it("waits for a chime that is still rendering instead of playing the voice", async () => {
    let resolve: (urls: Record<string, string>) => void = () => {};
    chime.promise = new Promise((r) => { resolve = r; });
    useSettings.setState({ sound: "chime" });
    const cues = new Cues(() => "en");

    tap(() => {
      cues.unlock();
      cues.handle({ type: "countdown", offsetMs: 0 });
    });
    await flush();
    expect(playing()).toHaveLength(0);

    resolve({ first: "blob:chime-first", next: "blob:chime-next", done: "blob:chime-done" });
    await flush();
    expect(playing().map((a) => a.src)).toEqual(["blob:chime-first"]);
  });

  it("drops a deferred chime if the brew is paused first", async () => {
    let resolve: (urls: Record<string, string>) => void = () => {};
    chime.promise = new Promise((r) => { resolve = r; });
    useSettings.setState({ sound: "chime" });
    const cues = new Cues(() => "en");
    tap(() => {
      cues.unlock();
      cues.handle({ type: "countdown", offsetMs: 0 });
    });
    cues.handle({ type: "hush" });
    resolve({ first: "blob:chime-first", next: "blob:chime-next", done: "blob:chime-done" });
    await flush();
    expect(playing()).toHaveLength(0);
  });
});

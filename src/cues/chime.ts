import type { Clip, ClipUrls } from "./clips";

/**
 * Code-generated alternative to the voice: five soft wooden ticks, one per
 * second, then a warm bell exactly on the step. Rendered once with an
 * OfflineAudioContext and encoded to WAV so it plays through the same <audio>
 * path as the voice (audible with the iPhone ringer switch on silent).
 */
const SAMPLE_RATE = 24000;
const RESOLVE_AT = 5;

type Ctx = OfflineAudioContext;

function tick(ctx: Ctx, at: number, strength: number) {
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, at);
  out.gain.linearRampToValueAtTime(0.5 * strength, at + 0.004);
  out.gain.exponentialRampToValueAtTime(0.0008, at + 0.16);
  out.connect(ctx.destination);

  const body = ctx.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(980, at);
  body.frequency.exponentialRampToValueAtTime(620, at + 0.05);
  body.connect(out);
  body.start(at);
  body.stop(at + 0.2);

  const knock = ctx.createOscillator();
  const knockGain = ctx.createGain();
  knock.type = "triangle";
  knock.frequency.setValueAtTime(310, at);
  knockGain.gain.setValueAtTime(0.5, at);
  knockGain.gain.exponentialRampToValueAtTime(0.001, at + 0.07);
  knock.connect(knockGain).connect(out);
  knock.start(at);
  knock.stop(at + 0.1);
}

/** A soft bell: slightly inharmonic partials with staggered decays. */
function bell(ctx: Ctx, at: number, frequency: number, level: number, length = 2.2) {
  const partials: [ratio: number, gain: number, decay: number][] = [
    [1, 0.55, length],
    [2.0, 0.2, length * 0.6],
    [2.76, 0.11, length * 0.42],
    [4.07, 0.05, length * 0.25],
    [0.5, 0.12, length * 0.9],
  ];
  partials.forEach(([ratio, gain, decay]) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency * ratio, at);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(level * gain, at + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0005, at + decay);
    osc.connect(env).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  });
}

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const G4 = 392.0;

const SCORES: Record<Clip, { seconds: number; resolve: (ctx: Ctx) => void }> = {
  first: {
    seconds: 7,
    resolve: (ctx) => {
      bell(ctx, RESOLVE_AT, G4, 0.42, 1.6);
      bell(ctx, RESOLVE_AT + 0.16, C5, 0.46, 2.0);
    },
  },
  next: {
    seconds: 7,
    resolve: (ctx) => bell(ctx, RESOLVE_AT, C5, 0.5, 2.0),
  },
  done: {
    seconds: 8,
    resolve: (ctx) => {
      bell(ctx, RESOLVE_AT, C5, 0.4, 2.4);
      bell(ctx, RESOLVE_AT + 0.17, E5, 0.36, 2.4);
      bell(ctx, RESOLVE_AT + 0.34, G5, 0.34, 2.6);
      bell(ctx, RESOLVE_AT + 0.51, C5 * 2, 0.2, 2.8);
    },
  },
};

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

async function render(clip: Clip): Promise<string> {
  const score = SCORES[clip];
  const ctx = new OfflineAudioContext(1, Math.ceil(score.seconds * SAMPLE_RATE), SAMPLE_RATE);
  for (let second = 0; second < RESOLVE_AT; second += 1) {
    tick(ctx, second + 0.001, second < 3 ? 0.8 : 1);
  }
  score.resolve(ctx);
  const rendered = await ctx.startRendering();
  return URL.createObjectURL(encodeWav(rendered.getChannelData(0), SAMPLE_RATE));
}

let chimes: Promise<ClipUrls | null> | null = null;

/** Resolves to blob URLs for each clip, or null where synthesis is unavailable. */
export function loadChimes(): Promise<ClipUrls | null> {
  if (chimes) return chimes;
  chimes = (async () => {
    if (typeof OfflineAudioContext === "undefined") return null;
    try {
      const [first, next, done] = await Promise.all([render("first"), render("next"), render("done")]);
      return { first, next, done };
    } catch {
      return null;
    }
  })();
  return chimes;
}

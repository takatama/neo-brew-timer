import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./PourPreviewAnimation.module.css";

export type PourAnimationMode = "none" | "handdrawn" | "calligraphy";

type LottieValue = { a?: number; k: number | number[] | LottieKeyframe[] };
type LottieKeyframe = { t: number; s: number[]; e?: number[]; h?: number };
type LottieTransform = Record<"a" | "s" | "p" | "r" | "o", LottieValue>;
type LottieShape = { ty: string; it?: LottieShape[]; ks?: { k: LottiePath }; c?: { k: number[] }; o?: LottieValue };
type LottiePath = { c: boolean; i: number[][]; o: number[][]; v: number[][] };
type LottieLayer = { ty: number; ip: number; op: number; st: number; ks: LottieTransform; refId?: string; shapes?: LottieShape[] };
type LottieData = { ip: number; op: number; w: number; h: number; layers: LottieLayer[]; assets: { id: string; layers: LottieLayer[] }[] };

function valueAt(value: LottieValue | undefined, frame: number, fallback: number | number[]) {
  if (!value) return fallback;
  if (!value.a || !Array.isArray(value.k) || typeof value.k[0] === "number") return value.k as number | number[];
  const keys = value.k as LottieKeyframe[];
  const index = Math.max(0, keys.findIndex((key, i) => frame >= key.t && (!keys[i + 1] || frame < keys[i + 1].t)));
  const key = keys[index];
  const next = keys[index + 1];
  if (!next || key.h === 1) return key.s.length === 1 ? key.s[0] : key.s;
  const amount = Math.min(1, Math.max(0, (frame - key.t) / (next.t - key.t)));
  const end = key.e ?? next.s;
  const result = key.s.map((start, i) => start + ((end[i] ?? start) - start) * amount);
  return result.length === 1 ? result[0] : result;
}

function applyTransform(context: CanvasRenderingContext2D, transform: LottieTransform, frame: number) {
  const position = valueAt(transform.p, frame, [0, 0]) as number[];
  const anchor = valueAt(transform.a, frame, [0, 0]) as number[];
  const scale = valueAt(transform.s, frame, [100, 100]) as number[];
  const rotation = valueAt(transform.r, frame, 0) as number;
  context.translate(position[0], position[1]);
  context.rotate(rotation * Math.PI / 180);
  context.scale(scale[0] / 100, scale[1] / 100);
  context.translate(-anchor[0], -anchor[1]);
  context.globalAlpha *= (valueAt(transform.o, frame, 100) as number) / 100;
}

function drawShape(context: CanvasRenderingContext2D, shape: LottiePath, color: string, alpha: number) {
  if (!shape.v.length) return;
  context.beginPath();
  context.moveTo(shape.v[0][0], shape.v[0][1]);
  for (let i = 1; i < shape.v.length; i += 1) {
    const previous = i - 1;
    context.bezierCurveTo(
      shape.v[previous][0] + shape.o[previous][0], shape.v[previous][1] + shape.o[previous][1],
      shape.v[i][0] + shape.i[i][0], shape.v[i][1] + shape.i[i][1],
      shape.v[i][0], shape.v[i][1],
    );
  }
  if (shape.c) context.closePath();
  context.globalAlpha *= alpha;
  context.fillStyle = color;
  context.fill();
}

function drawGroups(context: CanvasRenderingContext2D, shapes: LottieShape[], frame: number, color: string) {
  for (const group of shapes) {
    if (group.ty !== "gr" || !group.it) continue;
    const transform = group.it.find((item) => item.ty === "tr") as LottieShape & LottieTransform | undefined;
    const path = group.it.find((item) => item.ty === "sh")?.ks?.k;
    const fill = group.it.find((item) => item.ty === "fl");
    if (!path) continue;
    context.save();
    if (transform) applyTransform(context, transform, frame);
    drawShape(context, path, color, Number(valueAt(fill?.o, frame, 100)) / 100);
    context.restore();
  }
}

function drawLayers(context: CanvasRenderingContext2D, data: LottieData, layers: LottieLayer[], frame: number, color: string) {
  for (const layer of [...layers].reverse()) {
    if (frame < layer.ip || frame >= layer.op) continue;
    context.save();
    applyTransform(context, layer.ks, frame - layer.st);
    if (layer.ty === 0 && layer.refId) {
      const asset = data.assets.find((candidate) => candidate.id === layer.refId);
      if (asset) drawLayers(context, data, asset.layers, frame - layer.st, color);
    } else if (layer.shapes) {
      drawGroups(context, layer.shapes, frame - layer.st, color);
    }
    context.restore();
  }
}

function HanddrawnPour({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<LottieData | null>(null);

  useEffect(() => {
    let active = true;
    const abortController = new AbortController();
    void fetch("/assets/lottie/pour.json", { signal: abortController.signal }).then((response) => response.json()).then((data: LottieData) => {
      if (active) setData(data);
    }).catch(() => undefined);
    return () => { active = false; abortController.abort(); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.scale(canvas.width / data.w, canvas.height / data.h);
    drawLayers(context, data, data.layers, data.ip + progress * (data.op - data.ip - 1), "#704a2d");
    context.restore();
  }, [data, progress]);

  return <canvas ref={canvasRef} width="180" height="180" className={styles.art} />;
}

function CalligraphyPour({ progress }: { progress: number }) {
  const draw = Math.min(1, progress / 0.58);
  const stream = Math.min(1, Math.max(0, (progress - 0.28) / 0.42));
  return (
    <svg className={styles.art} viewBox="0 0 150 100" focusable="false">
      <defs>
        <mask id="calligraphy-reveal">
          <path className={styles.maskPath} pathLength="1" style={{ strokeDashoffset: 1 - draw }} d="M9 48 C10 25 26 14 49 17 C67 18 78 29 78 45 C78 64 62 72 39 72 C20 72 10 63 9 48 M20 26 C4 25 1 62 20 64 M73 33 C89 29 98 23 111 19 C114 22 113 26 108 28 C98 34 89 41 77 46 M104 58 L137 58 L130 84 L112 84 Z M106 87 L139 87" />
        </mask>
      </defs>
      <g mask="url(#calligraphy-reveal)" className={styles.ink}>
        <path d="M8 48 C8 24 25 12 49 14 C69 15 81 28 81 46 C81 66 64 75 39 75 C18 75 7 65 8 48 Z M21 23 C7 18 -2 29 1 48 C3 65 11 72 24 66 L20 59 C13 61 10 54 10 44 C10 34 14 29 23 30 Z" />
        <path d="M73 31 C91 28 99 20 113 16 C119 20 117 27 110 31 C98 37 90 44 77 49 L72 42 C85 37 94 30 104 24 C94 28 84 34 75 38 Z" />
        <path d="M103 56 C114 51 130 51 140 57 L132 87 H110 Z M105 61 L136 61 L129 81 H113 Z M103 84 C114 88 130 89 141 84 L139 91 H105 Z" fillRule="evenodd" />
      </g>
      <path className={styles.water} pathLength="1" style={{ strokeDashoffset: 1 - stream }} d="M109 30 C113 38 117 46 120 55" />
    </svg>
  );
}

export function PourPreviewAnimation({ mode, progress }: { mode: PourAnimationMode; progress: number }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  if (mode === "none" || reducedMotion) return null;
  return (
    <div className={styles.animation} aria-hidden="true" data-testid={`pour-animation-${mode}`} style={{ "--pour-scale": 1 + progress * 0.08 } as CSSProperties}>
      {mode === "handdrawn" ? <HanddrawnPour progress={progress} /> : <CalligraphyPour progress={progress} />}
    </div>
  );
}

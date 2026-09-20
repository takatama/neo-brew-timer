import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./PourPreviewAnimation.module.css";

export type PourAnimationMode = "none" | "handdrawn";

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

function HanddrawnPour({ progress, running }: { progress: number; running: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<LottieData | null>(null);
  const progressRef = useRef(progress);
  const progressReceivedAtRef = useRef(performance.now());
  const progressVelocityRef = useRef(1 / 5000);

  useEffect(() => {
    const now = performance.now();
    const elapsed = now - progressReceivedAtRef.current;
    const delta = progress - progressRef.current;
    if (delta > 0 && elapsed > 0) progressVelocityRef.current = Math.min(0.002, delta / elapsed);
    progressRef.current = progress;
    progressReceivedAtRef.current = now;
  }, [progress]);

  useEffect(() => {
    if (!running) return;
    // The initial frame may have been mounted for an arbitrary amount of time
    // before Brew is pressed. Start interpolation from the press, not mount time.
    progressReceivedAtRef.current = performance.now();
    progressVelocityRef.current = 1 / 5000;
  }, [running]);

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

    let animationFrame = 0;
    const render = (now: number) => {
      // Timer progress remains authoritative. Extrapolating only between its
      // 100 ms updates prevents visible stepping without affecting transitions.
      const smoothedProgress = running
        ? Math.min(1, progressRef.current + (now - progressReceivedAtRef.current) * progressVelocityRef.current)
        : progressRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.scale(canvas.width / data.w, canvas.height / data.h);
      drawLayers(context, data, data.layers, data.ip + smoothedProgress * (data.op - data.ip - 1), "#704a2d");
      context.restore();
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [data, running]);

  return <canvas ref={canvasRef} width="180" height="180" className={styles.art} />;
}

export function PourPreviewAnimation({ mode, progress, running = true }: { mode: PourAnimationMode; progress: number; running?: boolean }) {
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
    <div className={styles.animation} aria-hidden="true" data-testid={`pour-animation-${mode}`} data-running={running} style={{ "--pour-scale": 1 + progress * 0.08 } as CSSProperties}>
      <HanddrawnPour progress={progress} running={running} />
    </div>
  );
}

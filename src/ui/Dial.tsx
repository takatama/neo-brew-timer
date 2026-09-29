import { memo, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, usePageVisible, useReducedMotion } from "./hooks";
import styles from "./Dial.module.css";

/**
 * The brewing dial.
 *
 * - The ring has one tick per second of the current window. Lit ticks are the
 *   seconds left; the sweep eats them clockwise from 12 o'clock like a hand.
 *   The final five ticks (the spoken "5, 4, 3, 2, 1") are amber.
 * - The face fills with coffee to the current target's share of the water.
 * - Text is drawn twice: ink above the surface, cream where coffee covers it.
 *
 * Continuous motion is painted per frame from `getProgress`/`getLevel`
 * without re-rendering React. Numbers never animate through intermediate
 * values; they change only when the step does.
 */
export type DialTone = "ready" | "countdown" | "brewing" | "paused" | "done";

interface DialProps {
  tone: DialTone;
  label: string;
  value: string;
  unit?: string;
  suffix?: string;
  caption?: string;
  captionValue?: string;
  segments: number;
  leadSegments: number;
  approaching: boolean;
  getProgress: () => number;
  getLevel: () => number;
  /** Changes whenever a new step begins; triggers a gentle slosh. */
  stepKey: string;
}

const SIZE = 320;
const C = SIZE / 2;
const RING_R = 149;
const FACE_R = 131;
const RING_W = 8;
const CIRC = 2 * Math.PI * RING_R;

function arcPath(r: number, from: number, to: number): string {
  // Angles in turns: 0 is 12 o'clock, increasing clockwise.
  const a0 = from * 2 * Math.PI - Math.PI / 2;
  const a1 = to * 2 * Math.PI - Math.PI / 2;
  const large = to - from > 0.5 ? 1 : 0;
  const p = (a: number) => `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(a0)}A${r} ${r} 0 ${large} 1 ${p(a1)}`;
}

function wave(surface: number, phase: number, amplitude: number, wavelength: number): string {
  let d = "";
  for (let x = -8; x <= SIZE + 8; x += 8) {
    const y = surface + amplitude * Math.sin((x / wavelength) * 2 * Math.PI + phase);
    d += `${d ? "L" : "M"}${x} ${y.toFixed(2)}`;
  }
  return `${d}L${SIZE + 8} ${SIZE + 8}L-8 ${SIZE + 8}Z`;
}

/** Map a 0→1 fill onto the face; empty sits below the rim, full hides the surface. */
function surfaceFor(level: number): number {
  return C + FACE_R + 14 - Math.min(1, Math.max(0, level)) * (FACE_R * 2 + 30);
}

/** x positions that give each glyph its own fixed-width cell. */
function tabularX(value: string, fontSize: number): string {
  const widths = Array.from(value).map((ch) => (/\d/.test(ch) ? 0.6 : 0.3) * fontSize);
  const total = widths.reduce((sum, w) => sum + w, 0);
  let x = C - total / 2;
  return widths.map((w) => {
    const center = x + w / 2;
    x += w;
    return center.toFixed(1);
  }).join(" ");
}

const Ticks = memo(function Ticks({ segments, leadSegments, className, leadClassName }: {
  segments: number;
  leadSegments: number;
  className: string;
  leadClassName?: string;
}) {
  const paths = useMemo(() => {
    const count = Math.max(1, segments);
    const cap = RING_W / 2 / CIRC;
    const gap = Math.min(0.35 / count, 5 / CIRC);
    return Array.from({ length: count }, (_, i) => {
      const from = i / count + gap / 2 + cap;
      const to = Math.max(from + 0.0004, (i + 1) / count - gap / 2 - cap);
      return { d: arcPath(RING_R, from, to), lead: i >= count - leadSegments };
    });
  }, [segments, leadSegments]);
  return (
    <g>
      {paths.map((path, i) => (
        <path key={i} d={path.d} className={path.lead && leadClassName ? leadClassName : className} />
      ))}
    </g>
  );
});

const CAPTION_VALUE_SIZE = 27;

export function Dial(props: DialProps) {
  const {
    tone, label, value, unit, suffix, caption, captionValue,
    segments, leadSegments, approaching, getProgress, getLevel, stepKey,
  } = props;
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reducedMotion = useReducedMotion();
  const visible = usePageVisible();

  const maskArc = useRef<SVGCircleElement>(null);
  const hand = useRef<SVGCircleElement>(null);
  const back = useRef<SVGPathElement>(null);
  const front = useRef<SVGPathElement>(null);
  const clip = useRef<SVGPathElement>(null);
  const motion = useRef({ level: -1, phase: 0, slosh: 0, lastAt: 0 });
  const [ripple, setRipple] = useState<{ key: string; y: number } | null>(null);
  const lastStep = useRef(stepKey);

  // A new pour: slosh the surface and send out ripples where water lands.
  useLayoutEffect(() => {
    if (lastStep.current === stepKey) return;
    lastStep.current = stepKey;
    motion.current.slosh = 1;
    if (tone === "brewing" && !reducedMotion) setRipple({ key: stepKey, y: surfaceFor(getLevel()) });
  }, [stepKey, tone, reducedMotion, getLevel]);

  const running = tone === "brewing" || tone === "countdown";
  const liquidMoves = !reducedMotion && tone !== "paused";
  const animate = visible && running;

  /**
   * Paint the ring and liquid for this instant. Motion advances by the real
   * time since the last paint, whether that came from a frame or a render.
   * `settle` jumps the level (for paused, reset or finished views).
   */
  const paint = (settle: boolean) => {
    const m = motion.current;
    const now = performance.now();
    const dt = m.lastAt ? Math.min(1, (now - m.lastAt) / 1000) : 0;
    m.lastAt = now;
    const progress = Math.min(1, Math.max(0, getProgress()));

    maskArc.current?.setAttribute("stroke-dasharray", `${((1 - progress) * CIRC).toFixed(2)} ${CIRC.toFixed(2)}`);
    maskArc.current?.setAttribute("stroke-dashoffset", (-progress * CIRC).toFixed(2));
    if (hand.current) {
      const angle = progress * 2 * Math.PI - Math.PI / 2;
      hand.current.setAttribute("cx", (C + RING_R * Math.cos(angle)).toFixed(2));
      hand.current.setAttribute("cy", (C + RING_R * Math.sin(angle)).toFixed(2));
    }

    const target = Math.min(1, Math.max(0, getLevel()));
    if (m.level < 0 || reducedMotion || settle) m.level = target;
    else m.level += (target - m.level) * (1 - Math.exp(-dt / 0.5));
    if (liquidMoves) m.phase += dt * 1.1;
    m.slosh = Math.max(0, m.slosh - dt * 0.5);

    const amplitude = reducedMotion ? 1.8 : 2 + 6.5 * m.slosh * m.slosh;
    const surface = surfaceFor(m.level);
    const frontPath = wave(surface, m.phase, amplitude, 150);
    front.current?.setAttribute("d", frontPath);
    clip.current?.setAttribute("d", frontPath);
    back.current?.setAttribute("d", wave(surface - 3.5, -m.phase * 0.8 + 1.7, amplitude * 0.85, 112));
  };

  useFrame(animate, (_now, dt) => paint(dt === 0 && !animate), `${tone}:${stepKey}:${segments}`);

  // Also paint on every render (at least once a second while brewing), so the
  // dial stays truthful even where animation frames are throttled.
  useLayoutEffect(() => {
    paint(false);
  });

  const long = value.length >= 4;
  const valueSize = tone === "countdown" ? 136 : tone === "done" ? 70 : long ? 80 : 104;
  const valueY = tone === "countdown" ? 206 : tone === "done" ? 186 : 190;

  const text = (className: string) => (
    <g className={className}>
      <text x={C} y={96} className={styles.label} textAnchor="middle">{label}</text>
      <text key={value} x={C} y={valueY} className={styles.value} textAnchor="middle" style={{ fontSize: valueSize }}>
        <tspan>{value}</tspan>
        {unit && <tspan className={styles.unit} dx={3}>{unit}</tspan>}
        {suffix && <tspan className={styles.suffix} dx={3}>{suffix}</tspan>}
      </text>
      {caption && (
        <text x={C} y={228} className={styles.caption} textAnchor="middle">{caption}</text>
      )}
      {captionValue && (
        <text
          x={tabularX(captionValue, CAPTION_VALUE_SIZE)}
          y={259}
          className={styles.captionValue}
          textAnchor="middle"
          style={{ fontSize: CAPTION_VALUE_SIZE }}
        >
          {captionValue}
        </text>
      )}
    </g>
  );

  return (
    <div className={styles.dial} data-tone={tone} data-approaching={approaching || undefined}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={`${id}-face`}>
            <circle cx={C} cy={C} r={FACE_R} />
          </clipPath>
          <clipPath id={`${id}-liquid`}>
            <path ref={clip} d="" />
          </clipPath>
          <mask id={`${id}-lit`} maskUnits="userSpaceOnUse" x="0" y="0" width={SIZE} height={SIZE}>
            <circle
              ref={maskArc}
              cx={C}
              cy={C}
              r={RING_R}
              fill="none"
              stroke="#fff"
              strokeWidth={RING_W + 12}
              transform={`rotate(-90 ${C} ${C})`}
              strokeDasharray={`${CIRC} ${CIRC}`}
            />
          </mask>
          <linearGradient id={`${id}-coffee`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--coffee-top)" />
            <stop offset="0.5" stopColor="var(--coffee)" />
            <stop offset="1" stopColor="var(--coffee-deep)" />
          </linearGradient>
          <radialGradient id={`${id}-shade`} cx="0.5" cy="0.36" r="0.72">
            <stop offset="0.62" stopColor="var(--dial-face)" />
            <stop offset="1" stopColor="var(--bg-sink)" />
          </radialGradient>
        </defs>

        <Ticks segments={segments} leadSegments={leadSegments} className={styles.tickDim} />
        <g mask={`url(#${id}-lit)`} className={styles.lit}>
          <Ticks
            segments={segments}
            leadSegments={leadSegments}
            className={styles.tickLit}
            leadClassName={styles.tickLead}
          />
        </g>

        <circle cx={C} cy={C} r={FACE_R} fill={`url(#${id}-shade)`} />
        <g clipPath={`url(#${id}-face)`}>
          <path ref={back} className={styles.liquidBack} d="" />
        </g>
        {text(styles.inkText)}
        <g clipPath={`url(#${id}-face)`}>
          <path ref={front} d="" fill={`url(#${id}-coffee)`} />
          {ripple && tone === "brewing" && (
            <g key={ripple.key} className={styles.ripples}>
              {[0, 1, 2].map((i) => (
                <ellipse
                  key={i}
                  cx={C + 34}
                  cy={ripple.y + 6}
                  rx={46}
                  ry={9}
                  style={{ animationDelay: `${i * 260}ms` }}
                />
              ))}
            </g>
          )}
        </g>
        <g clipPath={`url(#${id}-liquid)`}>
          <g clipPath={`url(#${id}-face)`}>{text(styles.creamText)}</g>
        </g>
        <circle cx={C} cy={C} r={FACE_R} className={styles.rim} />

        <circle ref={hand} className={styles.hand} r={3.4} cx={C} cy={C - RING_R} />
      </svg>
    </div>
  );
}

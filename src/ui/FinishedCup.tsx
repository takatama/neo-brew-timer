import { useId } from "react";
import styles from "./FinishedCup.module.css";

/**
 * The finish, drawn in SVG: used where the 3D cup can't run (no WebGL) or
 * when motion is reduced. The full dial of coffee tilts into the surface of a
 * porcelain cup; the cup and saucer settle in around it and steam rises.
 *
 * Drawn in the dial's 320-unit space, as if seen from about 25° above: every
 * ellipse shares one ratio, light comes from the upper left, the coffee sits
 * below the lip so the far inside wall shows, and a fine ink line matches the
 * illustrated 3D look.
 */
const C = 160;
const FACE_R = 131;
const K = 0.4; // ellipse ratio for this viewing angle

const SAUCER = { cy: 244, rx: 134, thickness: 7 };
const WELL = { cy: 240, rx: 72 };
// The cup stands in the saucer's well: its near base reaches the front of
// its foot ellipse, so it never looks as if it hovers.
const DROP = 16;
const RIM = { cy: 128 + DROP, rx: 96 };
const OPENING = { rx: 89 };
const COFFEE = { cy: 139 + DROP, rx: 83 };

/** Shift every y in a path by the cup's drop. */
const drop = (d: string) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${x} ${Number(y) + DROP}`);

export function FinishedCup() {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `${raw}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  const scaleX = FACE_R / COFFEE.rx;
  const scaleY = FACE_R / (COFFEE.rx * K);
  const body = `M${C - RIM.rx} ${RIM.cy} C${C - RIM.rx} ${RIM.cy + 70} ${C - 54} ${RIM.cy + 112} ${C} ${RIM.cy + 112}`
    + ` C${C + 54} ${RIM.cy + 112} ${C + RIM.rx} ${RIM.cy + 70} ${C + RIM.rx} ${RIM.cy} Z`;
  // Both roots of the handle reach inside the body's outline; the body is
  // drawn over them, so the handle grows out of the cup with no cut end.
  const handle = drop("M250 146 C284 134 304 162 292 188 C283 207 250 217 214 214 L220 199"
    + " C256 201 272 193 278 180 C285 163 271 154 253 161 Z");

  return (
    <div className={styles.cup} aria-hidden="true">
      <svg viewBox="0 0 320 320" className={styles.svg} focusable="false">
        <defs>
          <linearGradient id={id("body")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--cup-light)" />
            <stop offset="0.45" stopColor="var(--cup)" />
            <stop offset="1" stopColor="var(--cup-shade)" />
          </linearGradient>
          <linearGradient id={id("depth")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stopColor="var(--cup-shade)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--cup-shade)" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id={id("saucer")} x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0" stopColor="var(--cup-light)" />
            <stop offset="1" stopColor="var(--cup)" />
          </linearGradient>
          <linearGradient id={id("inside")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--cup-shade)" />
            <stop offset="1" stopColor="var(--cup-light)" />
          </linearGradient>
          <radialGradient id={id("coffee")} cx="0.45" cy="0.4" r="0.7">
            <stop offset="0" stopColor="var(--coffee-deep)" />
            <stop offset="0.7" stopColor="var(--coffee)" />
            <stop offset="1" stopColor="var(--coffee-top)" />
          </radialGradient>
          <linearGradient id={id("steam")} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.25" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={id("steam-fade")} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height={140 + DROP}>
            <rect x="0" y="0" width="320" height={140 + DROP} fill={url("steam")} />
          </mask>
          <clipPath id={id("opening")}>
            <ellipse cx={C} cy={RIM.cy} rx={OPENING.rx} ry={OPENING.rx * K} />
          </clipPath>
          <filter id={id("blur")} x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={id("soft")} x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        <g className={styles.ware}>
          {/* Shadow on the table, then the saucer with a visible edge and well. */}
          <ellipse cx={C + 10} cy={SAUCER.cy + 20} rx={SAUCER.rx - 4} ry={(SAUCER.rx - 4) * K * 0.7} className={styles.cast} filter={url("blur")} />
          <ellipse cx={C} cy={SAUCER.cy + SAUCER.thickness} rx={SAUCER.rx} ry={SAUCER.rx * K} className={styles.saucerEdge} />
          <ellipse cx={C} cy={SAUCER.cy} rx={SAUCER.rx} ry={SAUCER.rx * K} fill={url("saucer")} className={styles.line} />
          <ellipse cx={C} cy={WELL.cy} rx={WELL.rx} ry={WELL.rx * K} className={styles.well} />

          <path d={handle} fill={url("body")} fillRule="evenodd" className={styles.line} />
          <path d={drop("M256 150 C282 144 294 164 286 184")} className={styles.handleShine} />

          <path d={body} fill={url("body")} className={styles.line} />
          <path d={body} fill={url("depth")} />
          <path d={`M${C - 80} ${RIM.cy + 44} C${C - 70} ${RIM.cy + 78} ${C - 48} ${RIM.cy + 96} ${C - 22} ${RIM.cy + 104}`} className={styles.bodyShine} />

          {/* The lip, then the inside: far wall in shade, coffee set below the lip. */}
          <ellipse cx={C} cy={RIM.cy} rx={RIM.rx} ry={RIM.rx * K} fill="var(--cup-light)" className={styles.line} />
          <ellipse cx={C} cy={RIM.cy} rx={OPENING.rx} ry={OPENING.rx * K} fill={url("inside")} className={styles.innerLine} />
        </g>

        <g clipPath={url("opening")}>
          <g
            className={styles.coffee}
            style={{ ["--from" as string]: `translate(0px, ${C - COFFEE.cy}px) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})` }}
          >
            <ellipse cx={C} cy={COFFEE.cy} rx={COFFEE.rx} ry={COFFEE.rx * K} fill={url("coffee")} />
            <ellipse cx={C} cy={COFFEE.cy} rx={COFFEE.rx - 2} ry={(COFFEE.rx - 2) * K} className={styles.crema} />
            <ellipse cx={C - 30} cy={COFFEE.cy - 12} rx={28} ry={5} className={styles.shine} filter={url("soft")} />
          </g>
        </g>

        {/* Lip highlight along the near edge, where the window catches it. */}
        <path
          d={`M${C - 88} ${RIM.cy + 8} A${RIM.rx - 3} ${(RIM.rx - 3) * K} 0 0 0 ${C - 10} ${RIM.cy + (RIM.rx - 3) * K}`}
          className={`${styles.ware} ${styles.lipShine}`}
        />

        <g className={styles.steam} mask={url("steam-fade")}>
          <path d={drop("M142 122 C128 102 156 88 142 66 S150 30 138 10")} />
          <path d={drop("M178 124 C166 104 192 90 180 68 S188 34 176 14")} />
        </g>
      </svg>
    </div>
  );
}

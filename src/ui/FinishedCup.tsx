import styles from "./FinishedCup.module.css";

/**
 * The finish: the full dial of coffee tilts back into the surface of a cup
 * seen from a three-quarter angle, the porcelain cup and saucer settle in
 * around it, and steam rises. Drawn in the dial's 320-unit space so the
 * starting circle matches the dial face exactly.
 */
const C = 160;
const FACE_R = 131;

// Coffee surface in the tilted view.
const SURFACE = { cx: C, cy: 142, rx: 84, ry: 24 };

export function FinishedCup() {
  const scaleX = FACE_R / SURFACE.rx;
  const scaleY = FACE_R / SURFACE.ry;
  return (
    <div className={styles.cup} aria-hidden="true">
      <svg viewBox="0 0 320 320" className={styles.svg} focusable="false">
        <defs>
          <linearGradient id="cup-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--cup-light)" />
            <stop offset="0.55" stopColor="var(--cup)" />
            <stop offset="1" stopColor="var(--cup-shade)" />
          </linearGradient>
          <linearGradient id="cup-saucer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--cup-light)" />
            <stop offset="1" stopColor="var(--cup-shade)" />
          </linearGradient>
          <radialGradient id="cup-coffee" cx="0.42" cy="0.35" r="0.75">
            <stop offset="0" stopColor="var(--coffee-top)" />
            <stop offset="0.6" stopColor="var(--coffee)" />
            <stop offset="1" stopColor="var(--coffee-deep)" />
          </radialGradient>
          <filter id="cup-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="cup-shadow" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <g className={styles.ware}>
          {/* Shadow on the table, then the saucer and its well. */}
          <ellipse cx={C} cy={262} rx={128} ry={20} className={styles.shadow} filter="url(#cup-shadow)" />
          <ellipse cx={C} cy={246} rx={138} ry={34} fill="url(#cup-saucer)" className={styles.edge} />
          <ellipse cx={C} cy={242} rx={96} ry={21} className={styles.well} />

          {/* Handle behind the body, so the body overlaps its roots. */}
          <path d="M238 168c40-8 50 44 6 48" className={styles.handle} />
          <path d="M238 168c40-8 50 44 6 48" className={styles.handleShine} />

          {/* Body: a gently tapered bowl. */}
          <path
            d={`M${C - 96} 142 C${C - 96} 204 ${C - 62} 240 ${C} 240 C${C + 62} 240 ${C + 96} 204 ${C + 96} 142 Z`}
            fill="url(#cup-body)"
            className={styles.edge}
          />
          <path d={`M${C - 78} 176 C${C - 70} 206 ${C - 50} 222 ${C - 26} 230`} className={styles.bodyShine} />

          {/* Rim: the lip of the cup around the coffee. */}
          <ellipse cx={C} cy={SURFACE.cy} rx={96} ry={30} className={styles.rim} />
        </g>

        {/* The coffee that filled the dial, tilting into place. */}
        <g
          className={styles.coffee}
          style={{ ["--from" as string]: `translate(0px, ${C - SURFACE.cy}px) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})` }}
        >
          <ellipse {...SURFACE} fill="url(#cup-coffee)" />
          <ellipse {...SURFACE} className={styles.crema} />
          <ellipse cx={C - 26} cy={SURFACE.cy - 8} rx={24} ry={4.5} className={styles.shine} filter="url(#cup-soft)" />
        </g>

        {/* Steam: soft, wide and translucent, rising from the surface. */}
        <g className={styles.steam} filter="url(#cup-soft)">
          <path d="M134 128c-12-18 12-30 0-50s10-32 2-52" />
          <path d="M162 124c-12-20 14-32 2-54s12-30 2-50" />
          <path d="M190 128c-12-18 12-30 0-50s10-32 2-52" />
        </g>
      </svg>
    </div>
  );
}

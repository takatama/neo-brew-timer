import { useLayoutEffect, useRef } from "react";
import type { BrewPlan } from "../brew/recipe";
import { formatClock } from "../brew/recipe";
import { useFrame } from "./hooks";
import styles from "./PourRail.module.css";

/**
 * The whole brew at a glance: one segment per pour, sized by how long it
 * lasts, filling as the brew moves along. Purely a map; the dial is the
 * instruction.
 */
interface Props {
  plan: BrewPlan;
  currentIndex: number;
  started: boolean;
  running: boolean;
  elapsedSeconds: number;
  getElapsedMs: () => number;
  label: string;
}

export function PourRail({ plan, currentIndex, started, running, elapsedSeconds, getElapsedMs, label }: Props) {
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const pours = plan.steps.filter((step) => step.kind !== "finish");

  const paint = () => {
    const t = getElapsedMs() / 1000;
    pours.forEach((step, i) => {
      const el = fills.current[i];
      if (!el) return;
      const span = step.untilSec - step.atSec;
      const ratio = started ? Math.min(1, Math.max(0, (t - step.atSec) / span)) : 0;
      el.style.transform = `scaleX(${ratio.toFixed(4)})`;
    });
  };
  useFrame(running, paint, `${currentIndex}:${started}:${plan.beans}`);
  useLayoutEffect(paint);

  return (
    <div className={styles.rail} role="img" aria-label={label}>
      <div className={styles.track}>
        {pours.map((step, i) => (
          <span
            key={step.index}
            className={styles.segment}
            style={{ flexGrow: step.untilSec - step.atSec }}
            data-state={!started ? "upcoming" : i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming"}
            data-last={step.isLastPour || undefined}
          >
            <span className={styles.fill} ref={(el) => { fills.current[i] = el; }} />
          </span>
        ))}
      </div>
      <div className={styles.times} aria-hidden="true">
        <span>{formatClock(elapsedSeconds)}</span>
        <span>{formatClock(plan.durationSec)}</span>
      </div>
    </div>
  );
}

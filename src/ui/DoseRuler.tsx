import { useEffect, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent } from "react";
import styles from "./DoseRuler.module.css";

/**
 * A swipeable ruler for the bean amount: one detent per gram, snapping into
 * place under a fixed needle. It is a real slider for assistive tech and the
 * keyboard (arrows, Page Up/Down, Home/End).
 */
interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  valueText: string;
  onDetent?: () => void;
}

const TICK = 12;

export function DoseRuler({ value, min, max, onChange, label, valueText, onDetent }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  /** The value currently under the needle, whoever put it there. */
  const shown = useRef<number | null>(null);
  const count = max - min + 1;

  // Move the ruler for values that came from elsewhere (buttons, keys, URL).
  // A value the ruler emitted itself is already under the needle, so a
  // swipe is never fought. Moves are instant: one detent per gram.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || shown.current === value) return;
    shown.current = value;
    el.scrollTo({ left: (value - min) * TICK, behavior: "auto" });
  }, [value, min]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const next = Math.min(max, Math.max(min, Math.round(el.scrollLeft / TICK) + min));
      if (next !== shown.current) {
        shown.current = next;
        onDetent?.();
        onChange(next);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [min, max, onChange, onDetent]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -5, PageUp: 5,
    };
    let next: number | null = null;
    if (event.key in steps) next = value + steps[event.key];
    if (event.key === "Home") next = min;
    if (event.key === "End") next = max;
    if (next === null) return;
    event.preventDefault();
    onChange(Math.min(max, Math.max(min, next)));
  };

  return (
    <div
      className={styles.ruler}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onKeyDown={onKeyDown}
    >
      <div ref={scroller} className={styles.scroller}>
        <div className={styles.scale} style={{ "--tick": `${TICK}px` } as CSSProperties}>
          {Array.from({ length: count }, (_, i) => {
            const grams = min + i;
            return (
              <span
                key={grams}
                className={styles.cell}
                data-major={grams % 5 === 0 || undefined}
                data-active={grams === value || undefined}
              >
                <span className={styles.tick} />
                {grams % 10 === 0 && <span className={styles.number}>{grams}</span>}
              </span>
            );
          })}
        </div>
      </div>
      <span className={styles.needle} aria-hidden="true" />
    </div>
  );
}

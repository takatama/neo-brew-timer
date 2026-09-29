import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import styles from "./controls.module.css";

interface Option<T extends string> {
  value: T;
  label: string;
}

/** A radio group drawn as a segmented control; arrow keys move the choice. */
export function Segmented<T extends string>({ label, value, options, onChange, compact = false }: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  compact?: boolean;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLElement>("[role=radio]");
    buttons?.[next]?.focus();
  };
  const selected = Math.max(0, options.findIndex((option) => option.value === value));
  return (
    <div
      className={`${styles.segmented} ${compact ? styles.compact : ""}`}
      role="radiogroup"
      aria-label={label}
      style={{ "--count": options.length, "--index": selected } as CSSProperties}
    >
      <span className={styles.thumb} aria-hidden="true" />
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          className={styles.segment}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ id, label, hint, checked, onChange }: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.switchRow} htmlFor={id}>
      <span className={styles.switchText}>
        <span>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.switch}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

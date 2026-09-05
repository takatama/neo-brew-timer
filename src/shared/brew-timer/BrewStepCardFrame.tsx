import type { ReactNode } from "react";
import styles from "./BrewStepCardFrame.module.css";

interface BrewStepCardFrameProps {
  ariaLabel: string;
  stepLabel: ReactNode;
  timeline: ReactNode;
  instruction: ReactNode;
  countdown: ReactNode;
  preview?: ReactNode;
  isImminent: boolean;
}

export function BrewStepCardFrame({
  ariaLabel,
  stepLabel,
  timeline,
  instruction,
  countdown,
  preview,
  isImminent,
}: BrewStepCardFrameProps) {
  return (
    <section
      className={`card ${styles.primaryCard}${isImminent ? ` ${styles.imminent}` : ""}`}
      aria-label={ariaLabel}
    >
      <div className={styles.cardBody}>
        <div className={styles.locationGroup}>
          <div className={styles.stepMeta}>{stepLabel}</div>
          {timeline}
        </div>
        <div
          className={`${styles.instruction}${preview ? ` ${styles.instructionWithPreview}` : ""}`}
        >
          {instruction}
        </div>
        {preview && <div className={styles.preview}>{preview}</div>}
      </div>
      <div className={styles.countdown}>{countdown}</div>
    </section>
  );
}

import type { ReactNode } from "react";
import styles from "./BrewStepCardFrame.module.css";

interface BrewStepCardFrameProps {
  ariaLabel: string;
  stepLabel: ReactNode;
  instruction: ReactNode;
  countdown: ReactNode;
  preview?: ReactNode;
  timeline: ReactNode;
  isImminent: boolean;
}

export function BrewStepCardFrame({ ariaLabel, stepLabel, instruction, countdown, preview, timeline, isImminent }: BrewStepCardFrameProps) {
  return (
    <section className={"card " + styles.primaryCard + (isImminent ? " " + styles.imminent : "")} aria-label={ariaLabel}>
      <div className={styles.meta}>{stepLabel}</div>
      <div className={styles.instruction}>{instruction}</div>
      <div className={styles.countdown}>{countdown}</div>
      {preview && <div className={styles.nextStep}>{preview}</div>}
      {timeline}
    </section>
  );
}

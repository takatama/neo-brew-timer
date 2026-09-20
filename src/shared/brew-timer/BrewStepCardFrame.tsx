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
  isPreviewImminent?: boolean;
  isPreviewExpanded?: boolean;
}

export function BrewStepCardFrame({ ariaLabel, stepLabel, instruction, countdown, preview, timeline, isImminent, isPreviewImminent = isImminent, isPreviewExpanded = false }: BrewStepCardFrameProps) {
  return (
    <section className={"card " + styles.primaryCard + (isImminent ? " " + styles.imminent : "")} aria-label={ariaLabel}>
      <div className={styles.meta}>{stepLabel}</div>
      <div className={styles.instruction}>{instruction}</div>
      <div className={styles.countdown + (isPreviewExpanded ? " " + styles.countdownBehindPreview : "")}>{countdown}</div>
      {preview && <div
        className={styles.nextStep + (isPreviewImminent ? " " + styles.nextStepImminent : "") + (isPreviewExpanded ? " " + styles.nextStepExpanded : "")}
        data-expanded={isPreviewExpanded || undefined}
      >{preview}</div>}
      {timeline}
    </section>
  );
}

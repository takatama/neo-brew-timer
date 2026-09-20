import { useTranslation } from "react-i18next";
import type { ComputedStep } from "../../recipe/types";
import styles from "./NextStepPreview.module.css";
import { PourPreviewAnimation, type PourAnimationMode } from "./PourPreviewAnimation";

export function NextStepPreview({ step, animationMode = "none", animationProgress = null, expanded = false }: {
  step: ComputedStep;
  animationMode?: PourAnimationMode;
  animationProgress?: number | null;
  expanded?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.preview} ${expanded ? styles.expanded : ""}`} data-expanded={expanded || undefined}>
      <span className={styles.label}>{t("timer.nextStep")}</span>
      <span className={styles.action}>
        {step.actionType === "none" ? t("timer.finish") : t("timer.targetAmount", { amount: step.cumulative })}
      </span>
      {animationProgress !== null && <div className={styles.artwork}>
        <PourPreviewAnimation mode={animationMode} progress={animationProgress} />
      </div>}
    </div>
  );
}

import { useTranslation } from "react-i18next";
import type { ComputedStep } from "../../recipe/types";
import styles from "./NextStepPreview.module.css";
import { PourPreviewAnimation, type PourAnimationMode } from "./PourPreviewAnimation";

export function NextStepPreview({ step, animationMode = "none", animationProgress = null }: {
  step: ComputedStep;
  animationMode?: PourAnimationMode;
  animationProgress?: number | null;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.preview}>
      <span className={styles.label}>{t("timer.nextStep")}</span>
      <span className={styles.action}>
        {step.actionType === "none" ? t("timer.finish") : t("timer.targetAmount", { amount: step.cumulative })}
      </span>
      {animationProgress !== null && <PourPreviewAnimation mode={animationMode} progress={animationProgress} />}
    </div>
  );
}

import { useTranslation } from "react-i18next";
import type { ComputedStep } from "../../recipe/types";
import styles from "./NextStepPreview.module.css";

export function NextStepPreview({ step }: { step: ComputedStep }) {
  const { t } = useTranslation();
  return (
    <div className={styles.preview}>
      <span className={styles.label}>{t("timer.nextStep")}</span>
      <span className={styles.action}>
        {step.actionType === "none" ? t("timer.finish") : t("timer.targetAmount", { amount: step.cumulative })}
      </span>
    </div>
  );
}

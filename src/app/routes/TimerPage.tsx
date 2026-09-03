import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTimerOrchestrator } from "../../features/timer/hooks/useTimerOrchestrator";
import { useSettingsStore } from "../../features/settings/store";
import { StepCard } from "../../features/timer/components/StepCard";
import { FinishCard } from "../../features/timer/components/FinishCard";
import { Timeline } from "../../features/timer/components/Timeline";
import { useCoffeeNews } from "../../features/timer/hooks/useCoffeeNews";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import styles from "./TimerPage.module.css";

export function TimerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    steps,
    beans,
    totalWater,
    currentStep,
    timer,
    remainingToNext,
    progress,
    isImminent,
    isRunningOrStarting,
    handlePlayPause,
    handleReset,
  } = useTimerOrchestrator();

  const isFinishStep = currentStep?.actionType === "none";
  const brewStepCount = steps.filter((step) => step.actionType !== "none").length;
  const { debugEnabled, debugSpeed, setDebugSpeed, language } = useSettingsStore();
  const { news, loading: newsLoading } = useCoffeeNews(language);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleResetTimer = () => {
    setResetDialogOpen(true);
  };

  const handleResetConfirm = () => {
    setResetDialogOpen(false);
    handleReset();
  };

  return (
    <main className="content">
      <section className="card">
        <div>{t("timer.recipe")}</div>
        <div className={styles.chipRow}>
          <span className={styles.chip}>{t("timer.beansChipLabel")} {beans}g</span>
          <span className={styles.chip}>{t("timer.waterChipLabel")} {totalWater}g</span>
        </div>
        <button className={styles.textLink} onClick={() => navigate("/setup")}>
          {t("timer.editParams")}
        </button>
      </section>

      {currentStep && currentStep.actionType !== "none" && (
        <StepCard
          step={currentStep}
          stepIndex={timer.currentStepIndex}
          totalSteps={brewStepCount}
          remainingSeconds={remainingToNext}
          progress={progress}
          isImminent={isImminent}
          nextTarget={steps[timer.currentStepIndex + 1]?.cumulative ?? currentStep.cumulative}
        />
      )}

      {currentStep?.actionType === "none" && (
        <FinishCard
          news={news}
          newsLoading={newsLoading}
        />
      )}

      <Timeline
        steps={steps}
        currentStepIndex={timer.currentStepIndex}
        currentTime={timer.currentTime}
      />

      <section className={styles.controls}>
        {!isFinishStep && (
          <div className={styles.primaryControlRow}>
            <button className={`${styles.btn} ${styles.primary}`} onClick={handlePlayPause}>
              {isRunningOrStarting ? t("timer.pause") : t("timer.play")}
            </button>
            {debugEnabled && (
              <button
                className={`${styles.speedToggle} ${debugSpeed === 5 ? styles.speedToggleActive : ""}`}
                onClick={() => setDebugSpeed(debugSpeed === 5 ? 1 : 5)}
              >
                {t("settings.debugX5")}
              </button>
            )}
          </div>
        )}
        <button className={`${styles.btn} ${styles.outline}`} onClick={handleResetTimer}>
          {t("timer.reset")}
        </button>
      </section>

      <ConfirmDialog
        open={resetDialogOpen}
        title={t("timer.reset")}
        message={t("timer.resetConfirm")}
        confirmLabel={t("timer.resetConfirmAction")}
        cancelLabel={t("timer.resetCancelAction")}
        onConfirm={handleResetConfirm}
        onCancel={() => setResetDialogOpen(false)}
      />
    </main>
  );
}

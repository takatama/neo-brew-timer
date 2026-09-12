import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker, useNavigate } from "react-router-dom";
import { useTimerOrchestrator } from "../../features/timer/hooks/useTimerOrchestrator";
import { useSettingsStore } from "../../features/settings/store";
import { StepCard } from "../../features/timer/components/StepCard";
import { FinishCard } from "../../features/timer/components/FinishCard";
import { NextStepPreview } from "../../features/timer/components/NextStepPreview";
import { useCoffeeNews } from "../../features/timer/hooks/useCoffeeNews";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { localizedPath } from "../../shared/i18n/routing";
import styles from "./TimerPage.module.css";

export function TimerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayLanguage = useDisplayLanguage();

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
    startupSeconds,
    handlePlayPause,
    handleReset,
  } = useTimerOrchestrator();

  const isFinishStep = currentStep?.actionType === "none";
  const brewStepCount = steps.filter((step) => step.actionType !== "none").length;
  const { debugEnabled, debugSpeed, setDebugSpeed } = useSettingsStore();
  const { news, loading: newsLoading } = useCoffeeNews(displayLanguage, Boolean(isFinishStep));
  const hasProgress = isRunningOrStarting || timer.status === "paused";
  const blocker = useBlocker(({ currentLocation, nextLocation }) => hasProgress && currentLocation.pathname.split("/").pop() !== nextLocation.pathname.split("/").pop());
  useEffect(() => {
    if (!hasProgress) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasProgress]);
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
      <section className={styles.summary}>
        <div className={styles.chipRow}>
          <span className={styles.chip}>
            {t("timer.beansChipLabel")} <span className={styles.chipValue}>{beans}g</span>
          </span>
          <span className={styles.chip}>
            {t("timer.waterChipLabel")} <span className={styles.chipValue}>{totalWater}g</span>
          </span>
        </div>
        <button className={styles.textLink} onClick={() => navigate(localizedPath(displayLanguage, "setup"))}>
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
          status={timer.status}
          startupSeconds={startupSeconds}
          nextStepPreview={steps[timer.currentStepIndex + 1] && (
            <NextStepPreview step={steps[timer.currentStepIndex + 1]} />
          )}
          steps={steps}
          currentTime={timer.currentTime}
        />
      )}

      {currentStep?.actionType === "none" && (
        <FinishCard
          news={news}
          newsLoading={newsLoading}
        />
      )}

      <section className={styles.controls}>
        {isFinishStep && <button className={`${styles.btn} ${styles.primary}`} onClick={() => navigate(localizedPath(displayLanguage, "setup"))}>{t("timer.brewAgain")}</button>}
        {!isFinishStep && (
          <div className={styles.primaryControlRow}>
            <button className={`${styles.btn} ${styles.primary}`} onClick={handlePlayPause}>
              {startupSeconds !== null ? t("timer.cancelStart") : isRunningOrStarting ? t("timer.pause") : t(timer.status === "paused" ? "timer.resume" : "timer.play")}
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
        {!isFinishStep && (
          <button className={`${styles.btn} ${styles.outline}`} onClick={handleResetTimer}>
            {t("timer.reset")}
          </button>
        )}
      </section>

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title={t("timer.leaveTitle")}
        message={t("timer.leaveConfirm")}
        confirmLabel={t("timer.leaveAction")}
        cancelLabel={t("timer.resetCancelAction")}
        onConfirm={() => { handleReset(); blocker.proceed?.(); }}
        onCancel={() => blocker.reset?.()}
      />
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

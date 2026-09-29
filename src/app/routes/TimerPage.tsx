import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker, useNavigate } from "react-router-dom";
import { useTimerOrchestrator } from "../../features/timer/hooks/useTimerOrchestrator";
import { useSettingsStore } from "../../features/settings/store";
import { BrewGuide } from "../../features/timer/components/BrewGuide";
import { CoffeeReading } from "../../features/timer/components/CoffeeReading";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { BrewIllustration } from "../../shared/components/BrewIllustration";
import { Icon } from "../../shared/components/Icon";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { localizedPath } from "../../shared/i18n/routing";
import { primeVoiceAudio } from "../../features/timer/hooks/voiceAudio";
import styles from "./TimerPage.module.css";

export function TimerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useDisplayLanguage();
  const settings = useSettingsStore();
  const {
    steps,
    audioBlocked,
    beans,
    totalWater,
    currentStep,
    timer,
    remainingToNext,
    progress,
    isRunningOrStarting,
    startupSeconds,
    handlePlayPause,
    handleReset,
  } = useTimerOrchestrator();
  const finished = timer.status === "finished";
  const starting = startupSeconds !== null;
  const previewStart = starting;
  const hasProgress = isRunningOrStarting || timer.status === "paused";
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasProgress &&
      currentLocation.pathname.split("/").pop() !==
        nextLocation.pathname.split("/").pop(),
  );
  useEffect(() => {
    if (!hasProgress) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasProgress]);
  const [resetOpen, setResetOpen] = useState(false);
  const toggle = () => {
    if (!isRunningOrStarting && settings.isSoundEnabled())
      primeVoiceAudio(language, settings.voice);
    handlePlayPause();
  };
  return (
    <main
      className={`content ${styles.timer} ${finished ? styles.finished : ""}`}
    >
      {!finished && (
        <>
          <section className={styles.summary}>
            <div>
              <span>
                {t("timer.beansChipLabel")} {beans}g
              </span>
              <i>·</i>
              <span>
                {t("timer.waterChipLabel")} {totalWater}g
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate(localizedPath(language, "setup"))}
              aria-label={t("timer.editParams")}
            >
              {t("experience.changeDose")}
            </button>
          </section>
          {currentStep && (
            <BrewGuide
              step={currentStep}
              steps={steps}
              stepIndex={timer.currentStepIndex}
              remainingSeconds={remainingToNext}
              progress={progress}
              currentTime={timer.currentTime}
              status={timer.status}
              startupSeconds={previewStart ? (startupSeconds ?? 5) : null}
            />
          )}
          <div className={styles.controls}>
            <button className={styles.pause} type="button" onClick={toggle}>
              <Icon name={isRunningOrStarting ? "pause" : "play"} size={17} />
              {t(
                starting
                  ? "timer.cancelStart"
                  : isRunningOrStarting
                    ? "timer.pause"
                    : timer.status === "paused"
                      ? "timer.resume"
                      : "timer.play",
              )}
            </button>
            <button
              className={styles.reset}
              type="button"
              onClick={() => setResetOpen(true)}
              aria-label={t("timer.reset")}
            >
              <Icon name="reset" size={18} />
              <span>{t("timer.reset")}</span>
            </button>
          </div>
          <p
            className={styles.screenHint}
            role={
              audioBlocked && settings.isSoundEnabled() ? "status" : undefined
            }
          >
            {t(
              audioBlocked && settings.isSoundEnabled()
                ? "experience.audioFallback"
                : "experience.keepOpen",
            )}
          </p>
        </>
      )}
      {finished && (
        <>
          <section className={styles.finishScene}>
            <p className="eyebrow">A MOMENT WELL BREWED</p>
            <BrewIllustration
              finished
              animated
              className={styles.finishIllustration}
            />
            <div role="status">
              <h1>{t("experience.finishHeading")}</h1>
              <p className={styles.enjoy}>{t("timer.enjoyCoffee")}</p>
            </div>
            <p className={styles.drawdown}>{t("experience.finishHint")}</p>
            <div className={styles.receipt}>
              <div>
                <span>{t("setup.beans")}</span>
                <strong>
                  {beans}
                  <small>g</small>
                </strong>
              </div>
              <div>
                <span>{t("setup.water")}</span>
                <strong>
                  {totalWater}
                  <small>g</small>
                </strong>
              </div>
              <div>
                <span>{t("experience.brewTime")}</span>
                <strong>3:30</strong>
              </div>
            </div>
          </section>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate(localizedPath(language, "setup"))}
          >
            {t("timer.brewAgain")}
            <Icon name="arrow" size={20} />
          </button>
          <CoffeeReading />
        </>
      )}
      <ConfirmDialog
        open={blocker.state === "blocked"}
        title={t("timer.leaveTitle")}
        message={t("timer.leaveConfirm")}
        confirmLabel={t("timer.leaveAction")}
        cancelLabel={t("timer.resetCancelAction")}
        onConfirm={() => {
          handleReset();
          blocker.proceed?.();
        }}
        onCancel={() => blocker.reset?.()}
      />
      <ConfirmDialog
        open={resetOpen}
        title={t("timer.reset")}
        message={t("timer.resetConfirm")}
        confirmLabel={t("timer.resetConfirmAction")}
        cancelLabel={t("timer.resetCancelAction")}
        onConfirm={() => {
          setResetOpen(false);
          handleReset();
        }}
        onCancel={() => setResetOpen(false)}
      />
    </main>
  );
}

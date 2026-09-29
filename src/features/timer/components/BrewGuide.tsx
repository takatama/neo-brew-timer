import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { ComputedStep } from "../../recipe/types";
import type { TimerStatus } from "../hooks/useTimer";
import { formatTime } from "../../recipe/waterCalc";
import { Icon } from "../../../shared/components/Icon";
import styles from "./BrewGuide.module.css";
interface Props {
  step: ComputedStep;
  steps: ComputedStep[];
  stepIndex: number;
  remainingSeconds: number;
  progress: number;
  currentTime: number;
  status: TimerStatus;
  startupSeconds: number | null;
}
export function BrewGuide({
  step,
  steps,
  stepIndex,
  remainingSeconds,
  progress,
  currentTime,
  status,
  startupSeconds,
}: Props) {
  const { t } = useTranslation();
  const starting = startupSeconds !== null;
  const paused = status === "paused";
  const pours = steps.filter((item) => item.actionType !== "none");
  const last = stepIndex === pours.length - 1;
  const imminent =
    !starting &&
    status === "running" &&
    remainingSeconds > 0 &&
    remainingSeconds <= 5;
  const next = starting ? step : steps[stepIndex + 1];
  const seconds = Math.ceil(remainingSeconds);
  const action = starting
    ? "timer.untilStart"
    : paused
      ? "experience.pausedHeading"
      : status === "idle"
        ? "timer.getReady"
        : stepIndex === 0
          ? "experience.bloomAction"
          : last
            ? "timer.lastPour"
            : "timer.pour";
  return (
    <section
      className={`${styles.guide} ${imminent ? styles.imminent : ""}`}
      aria-label={t("timer.pourCount", {
        current: stepIndex + 1,
        total: pours.length,
      })}
      data-paused={paused}
    >
      <div className={styles.topline}>
        <div className={styles.pourCount}>
          <strong>
            {starting ? "—" : String(stepIndex + 1).padStart(2, "0")}
          </strong>
          <span>/ {String(pours.length).padStart(2, "0")}</span>
          <span>{t("experience.pourLabel")}</span>
        </div>
        <span className={styles.state} role="status">
          <i data-running={status === "running"} />
          {t(starting ? "timer.state_starting" : `timer.state_${status}`)}
        </span>
      </div>
      <div className={styles.current}>
        <h1 aria-live="polite">{t(action)}</h1>
        {starting ? (
          <>
            <div
              className={styles.startNumber}
              role="timer"
              aria-live="off"
              aria-label={t("timer.starting", { seconds: startupSeconds })}
            >
              {startupSeconds}
              <span>{t("timer.secondsUnit")}</span>
            </div>
            <p className={styles.pourHint}>{t("experience.getKettleReady")}</p>
          </>
        ) : (
          <>
            <p className={styles.scaleLabel}>{t("experience.scaleTarget")}</p>
            <div
              className={styles.target}
              role="status"
              aria-atomic="true"
              aria-label={t("timer.targetAccessible", {
                amount: step.cumulative,
              })}
            >
              <strong>{step.cumulative}</strong>
              <span>
                g<small>{t("timer.targetSuffix")}</small>
              </span>
            </div>
            <div className={styles.increment}>
              {t("experience.addWater", { amount: step.increment })}
            </div>
            <p className={styles.pourHint}>
              {t(
                paused
                  ? "experience.pausedHint"
                  : last
                    ? "experience.lastPourHint"
                    : stepIndex === 0
                      ? "experience.bloomHint"
                      : "experience.pourHint",
              )}
            </p>
          </>
        )}
      </div>
      <div
        className={styles.next}
        style={{ "--progress": starting ? 0 : progress } as CSSProperties}
        data-imminent={imminent}
        data-starting={starting}
      >
        <div className={styles.countdown}>
          <span className={styles.caption}>
            {t(
              starting
                ? "timer.getReady"
                : last
                  ? "timer.untilFinish"
                  : "timer.untilNext",
            )}
          </span>
          {starting ? (
            <div className={styles.startReminder}>
              <Icon name="arrow" size={23} />
              <span>{t("experience.scaleIsReady")}</span>
            </div>
          ) : (
            <div
              role="timer"
              aria-live="off"
              aria-label={t(
                last
                  ? "experience.finishCountdown"
                  : "experience.pourCountdown",
                { seconds },
              )}
            >
              <strong>{seconds}</strong>
              <span>{t("timer.secondsUnit")}</span>
            </div>
          )}
        </div>
        <div className={styles.nextTarget}>
          <span className={styles.caption}>
            {t(
              starting
                ? "timer.firstStep"
                : last
                  ? "experience.afterLastPour"
                  : imminent
                    ? "experience.comingNow"
                    : "timer.nextStep",
            )}
          </span>
          {next?.actionType === "none" ? (
            <div className={styles.wait}>
              <Icon name="cup" size={18} />
              <span>{t("experience.nextDrawdown")}</span>
            </div>
          ) : (
            <strong>
              {next?.cumulative}
              <span>
                g<small>{t("timer.targetSuffix")}</small>
              </span>
            </strong>
          )}
        </div>
      </div>
      <div className={styles.journey}>
        <div
          className={styles.timeline}
          role="img"
          aria-label={t("experience.progressAccessible", {
            current: starting ? 0 : stepIndex + 1,
            total: pours.length,
          })}
        >
          {pours.map((item, index) => (
            <span
              key={item.timeSec}
              data-done={!starting && index < stepIndex}
              data-current={!starting && index === stepIndex}
            />
          ))}
          <Icon name="cup" size={14} />
        </div>
        <div className={styles.elapsed}>
          <span>
            {t("timer.elapsed")} {formatTime(currentTime)}
          </span>
          <span>{t("experience.totalTime")}</span>
        </div>
      </div>
    </section>
  );
}

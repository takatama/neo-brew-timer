import { Trans, useTranslation } from "react-i18next";
import type { ComputedStep } from "../../recipe/types";
import { Countdown } from "./Countdown";
import styles from "./StepCard.module.css";

interface Props {
  step: ComputedStep;
  stepIndex: number;
  totalSteps: number;
  remainingSeconds: number;
  progress: number;
  isImminent: boolean;
  nextTarget: number;
}

function VerbText({
  step,
  stepIndex,
}: {
  step: ComputedStep;
  stepIndex: number;
}) {
  const { t } = useTranslation();

  const withNote = (label: string, note: string) => (
    <>
      {label}
      <span className={styles.verbNote}>({note})</span>
    </>
  );

  switch (step.actionType) {
    case "bloom":
      return <>{t("timer.bloom")}</>;
    case "pour":
      return <>{t(stepIndex === 9 ? "timer.brew" : "timer.pour")}</>;
    case "switch_close_pour":
      return withNote(t("timer.close"), t("timer.up"));
    case "switch_open_pour":
    case "pour_cool":
      return withNote(t("timer.open"), t("timer.down"));
    case "switch_open":
      return withNote(t("timer.open"), t("timer.down"));
    case "drawdown":
      return <>{t("timer.drawdown")}</>;
    case "none":
      return <>{t("timer.finish")}</>;
    default:
      return <>{t("timer.wait")}</>;
  }
}

function InstructionText({
  step,
  stepIndex,
}: {
  step: ComputedStep;
  stepIndex: number;
}) {
  const { t } = useTranslation();

  if (step.actionType === "none") {
    return <>{t("timer.enjoyCoffee")}</>;
  }
  if (step.actionType === "drawdown") {
    return <>{t("timer.waitForDrawdown")}</>;
  }
  if (step.actionType === "switch_open") {
    return <>{t("timer.openWaitNoPour")}</>;
  }

  const amount = step.cumulative;
  if (step.actionType === "pour" && stepIndex >= 1 && stepIndex <= 8) {
    return (
      <Trans
        i18nKey="timer.toAmount"
        values={{ amount }}
        components={{ num: <span className="pour-number" />, unit: <span className="pour-unit" /> }}
      />
    );
  }

  if (
    step.actionType === "pour" ||
    step.actionType === "bloom" ||
    step.actionType === "switch_close_pour" ||
    step.actionType === "switch_open_pour"
  ) {
    return (
      <Trans
        i18nKey="timer.pourToAmount"
        values={{ amount }}
        components={{ num: <span className="pour-number" />, unit: <span className="pour-unit" /> }}
      />
    );
  }

  if (step.actionType === "pour_cool") {
    return (
      <Trans
        i18nKey="timer.pourCoolTo"
        values={{ amount }}
        components={{ num: <span className="pour-number" />, unit: <span className="pour-unit" /> }}
      />
    );
  }

  return null;
}

export function StepCard({
  step,
  stepIndex,
  totalSteps,
  remainingSeconds,
  progress,
  isImminent,
  nextTarget,
}: Props) {
  return (
    <section className={`card ${styles.primaryCard}${isImminent ? ` ${styles.imminent}` : ""}`}>
      <div className={styles.cardBody}>
        <div className={styles.instruction}>
          <div className={styles.stepMeta}>
            STEP {stepIndex + 1} / {totalSteps}
          </div>
          <div className={styles.stepVerb}>
            <VerbText step={step} stepIndex={stepIndex} />
          </div>
          <div className={styles.stepSub}>
            <InstructionText step={step} stepIndex={stepIndex} />
          </div>
        </div>
        <div className={styles.countdownArea}>
          <Countdown
            remainingSeconds={remainingSeconds}
            progress={progress}
            isImminent={isImminent}
            nextTarget={nextTarget}
          />
        </div>
      </div>
    </section>
  );
}

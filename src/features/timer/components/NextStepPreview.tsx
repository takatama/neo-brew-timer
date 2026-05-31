import { Trans, useTranslation } from "react-i18next";
import type { ComputedStep } from "../../recipe/types";
import { LottiePlayer, buildLottieQueue } from "../../../shared/components/LottiePlayer";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./NextStepPreview.module.css";

interface Props {
  step: ComputedStep;
  prevCumulative: number;
  visible: boolean;
}

function AnimationInstructionText({
  step,
  displayAmount,
}: {
  step: ComputedStep;
  displayAmount: number;
}) {
  const { t } = useTranslation();

  if (step.actionType === "pour") {
    return (
      <Trans
        i18nKey="timer.pourToAmount"
        values={{ amount: displayAmount }}
        components={{ num: <span className="pour-number" />, unit: <span className="pour-unit" /> }}
      />
    );
  }
  if (step.actionType === "switch_close_pour") {
    return (
      <Trans
        i18nKey="timer.closePourTo"
        values={{ amount: displayAmount }}
        components={{ num: <span className="pour-number" />, unit: <span className="pour-unit" /> }}
      />
    );
  }
  if (step.actionType === "switch_open_pour") {
    return (
      <Trans
        i18nKey="timer.openPourTo"
        values={{ amount: displayAmount }}
        components={{ num: <span className="pour-number" />, unit: <span className="pour-unit" /> }}
      />
    );
  }
  if (step.actionType === "pour_cool") {
    return (
      <Trans
        i18nKey="timer.pourCoolTo"
        values={{ amount: displayAmount }}
        components={{ num: <span className="pour-number" />, unit: <span className="pour-unit" /> }}
      />
    );
  }
  if (step.actionType === "switch_open") {
    return <>{t("timer.openWaitNoPour")}</>;
  }
  if (step.actionType === "none") {
    return <>{t("timer.enjoyCoffee")}</>;
  }
  return <>{t("timer.wait")}</>;
}

export function NextStepPreview({ step, prevCumulative, visible }: Props) {
  const { t } = useTranslation();
  const [displayAmount, setDisplayAmount] = useState(prevCumulative);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const isPour =
    step.actionType === "pour" ||
    step.actionType === "switch_close_pour" ||
    step.actionType === "switch_open_pour" ||
    step.actionType === "pour_cool";

  useEffect(() => {
    if (!visible || !isPour) {
      setDisplayAmount(prevCumulative);
      return;
    }

    const from = prevCumulative;
    const to = step.cumulative;
    if (from === to) return;

    startRef.current = performance.now();
    const duration = 1000;

    const animate = (ts: number) => {
      const elapsed = ts - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      setDisplayAmount(Math.round(from + (to - from) * progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    // Delay the counting animation to sync with lottie "pour" animation
    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 800);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, isPour, prevCumulative, step.cumulative]);

  const lottieKeys = useMemo(
    () => buildLottieQueue(step.actionType),
    [step.actionType],
  );

  if (!visible) return null;

  return (
    <section className={`card ${styles.animationCard}`}>
      <div className="card-title">{t("timer.nextStep")}</div>
      <div className={styles.animationRow}>
        <LottiePlayer animationKeys={lottieKeys} />
        <div className={styles.animationText}>
          <AnimationInstructionText
            step={step}
            displayAmount={isPour ? displayAmount : step.cumulative}
          />
        </div>
      </div>
    </section>
  );
}

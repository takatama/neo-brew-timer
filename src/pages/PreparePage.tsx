import { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { brew } from "../brew/session";
import { MAX_BEANS, MIN_BEANS, formatClock, planBrew } from "../brew/recipe";
import { canVibrate } from "../cues";
import { GuideSheet } from "../guide/GuideSheet";
import { useDisplayLanguage } from "../i18n/DisplayLanguage";
import { localizedPath } from "../i18n/routing";
import { SettingsSheet } from "../settings/SettingsSheet";
import { useBeans, useSettings } from "../settings/store";
import { DoseRuler } from "../ui/DoseRuler";
import { Mark } from "../ui/Mark";
import { MusicButton } from "../ui/MusicButton";
import { OfflineNotice } from "../ui/OfflineNotice";
import { GearIcon, GrindIcon, MinusIcon, PlayIcon, PlusIcon, ScaleIcon, ThermoIcon } from "../ui/icons";
import styles from "./PreparePage.module.css";

export function PreparePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useDisplayLanguage();
  const [searchParams] = useSearchParams();
  const beans = useBeans((s) => s.beans);
  const setBeans = useBeans((s) => s.setBeans);
  const countdown = useSettings((s) => s.countdown);
  const music = useSettings((s) => s.music);
  const [sheet, setSheet] = useState<"settings" | "guide" | null>(null);

  useEffect(() => {
    // Arriving here always means no brew is in progress.
    if (brew.status !== "idle") brew.reset();
  }, []);

  useEffect(() => {
    const requested = Number(searchParams.get("beans"));
    if (Number.isFinite(requested) && requested > 0) setBeans(requested);
  }, [searchParams, setBeans]);

  useEffect(() => {
    brew.prepare(beans);
  }, [beans]);

  const plan = useMemo(() => planBrew(beans), [beans]);
  const pourAmounts = plan.steps.filter((step) => step.kind !== "finish").map((step) => step.amount);
  const low = Math.min(...pourAmounts);
  const high = Math.max(...pourAmounts);
  const perPour = low === high ? `${low} g` : `${low}–${high} g`;

  const detent = useCallback(() => {
    if (canVibrate && useSettings.getState().vibrate) {
      try {
        navigator.vibrate(4);
      } catch {
        // Ignored: purely tactile.
      }
    }
  }, []);

  const start = () => {
    brew.prepare(beans);
    brew.start();
    navigate(localizedPath(language, "brew"));
  };

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <span className={styles.brand}>
          <Mark size={30} />
          <span>{t("app.name")}</span>
        </span>
        <span className={styles.barActions}>
          {music && <MusicButton />}
          <button type="button" className={styles.guidePill} onClick={() => setSheet("guide")}>
            {t("prepare.guide")}
          </button>
          <button type="button" className={styles.iconButton} onClick={() => setSheet("settings")} aria-label={t("prepare.settings")}>
            <GearIcon />
          </button>
        </span>
      </header>

      <OfflineNotice />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{t("prepare.eyebrow")}</p>
          <h1 className={styles.headline}>
            <Trans i18nKey="prepare.headline" components={{ br: <br /> }} />
          </h1>
          <p className={styles.lead}>{t("prepare.lead")}</p>
        </section>

        <section className={styles.dose} aria-labelledby="dose-label">
          <span id="dose-label" className={styles.doseLabel}>{t("prepare.coffee")}</span>
          <div className={styles.doseRow}>
            <button
              type="button"
              className={styles.step}
              onClick={() => setBeans(beans - 1)}
              disabled={beans <= MIN_BEANS}
              aria-label={t("prepare.less")}
            >
              <MinusIcon />
            </button>
            <output className={styles.doseValue} aria-live="polite">
              <span className="display">{beans}</span>
              <span className={styles.doseUnit}>g</span>
            </output>
            <button
              type="button"
              className={styles.step}
              onClick={() => setBeans(beans + 1)}
              disabled={beans >= MAX_BEANS}
              aria-label={t("prepare.more")}
            >
              <PlusIcon />
            </button>
          </div>
          <DoseRuler
            value={beans}
            min={MIN_BEANS}
            max={MAX_BEANS}
            onChange={setBeans}
            onDetent={detent}
            label={t("prepare.doseLabel")}
            valueText={`${beans} g`}
          />
          <dl className={styles.stats}>
            <div>
              <dt>{t("prepare.water")}</dt>
              <dd><span className="display">{plan.water}</span> g</dd>
            </div>
            <div>
              <dt>{t("prepare.pours")}</dt>
              <dd>{t("prepare.poursValue", { count: plan.pourCount, amount: perPour })}</dd>
            </div>
            <div>
              <dt>{t("prepare.time")}</dt>
              <dd><span className="display">{formatClock(plan.durationSec)}</span></dd>
            </div>
          </dl>
        </section>

        <section className={styles.ready} aria-labelledby="ready-heading">
          <h2 id="ready-heading" className={styles.readyHeading}>{t("prepare.ready")}</h2>
          <ul className={styles.readyList}>
            <li><GrindIcon size={20} /><span>{t("prepare.grind")}</span></li>
            <li><ThermoIcon size={20} /><span>{t("prepare.temperature")}</span></li>
            <li><ScaleIcon size={20} /><span>{t("prepare.tare")}</span></li>
          </ul>
        </section>
      </main>

      <footer className={styles.actions}>
        <button type="button" className={styles.start} onClick={start}>
          <PlayIcon size={20} />
          <span>{t("prepare.start")}</span>
        </button>
        <p className={styles.startHint}>{t(countdown ? "prepare.startCountdown" : "prepare.startNow")}</p>
      </footer>

      <SettingsSheet open={sheet === "settings"} onClose={() => setSheet(null)} />
      <GuideSheet open={sheet === "guide"} onClose={() => setSheet(null)} beans={beans} />
    </div>
  );
}

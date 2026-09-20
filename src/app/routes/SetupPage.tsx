import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionStore } from "../../features/timer/store";
import { useSettingsStore } from "../../features/settings/store";
import type { BgmDayOfWeek } from "../../features/settings/types";
import { neoBrewMethod, computeSteps, getTotalWater } from "../../features/recipe";
import { CoffeeNews } from "../../features/timer/components/CoffeeNews";
import { useCoffeeNews } from "../../features/timer/hooks/useCoffeeNews";
import styles from "./SetupPage.module.css";
import { getEquipmentItems, type SupportedLanguage } from "../../shared/affiliate/amazon";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { localizedPath } from "../../shared/i18n/routing";

export function SetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayLanguage = useDisplayLanguage();
  const [searchParams] = useSearchParams();
  const { beans, setBeans } = useSessionStore();
  const { debugEnabled, startDelay, debugBgmDayOfWeek, setDebugBgmDayOfWeek } = useSettingsStore();
  const { news, loading: newsLoading } = useCoffeeNews(displayLanguage, debugEnabled);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const beansParam = searchParams.get("beans");
    if (beansParam) {
      const n = Number(beansParam);
      if (Number.isFinite(n) && n > 0) setBeans(n);
    }
  }, [searchParams, setBeans]);

  const lang: SupportedLanguage = displayLanguage;
  const totalWater = getTotalWater(beans, neoBrewMethod.waterRatio);
  const pourSteps = computeSteps(neoBrewMethod, beans).filter(
    (step) => step.actionType !== "none",
  );
  const equipment = getEquipmentItems(lang);

  const handleStart = () => {
    navigate(localizedPath(displayLanguage, "timer", "?autostart=1"));
  };

  return (
    <main className="content">
      <header className={styles.heading}><h1>{t("setup.heading")}</h1></header>
      <section className="card">
        <div className={styles.stepperRow}>
          <span className={styles.beansLabel}>{t("setup.beans")}</span>
          <div className={styles.stepperControls}>
            <button
              className={styles.btnIcon}
              onClick={() => setBeans(Math.max(1, beans - 1))}
              aria-label={t("setup.decrease")}
              disabled={beans <= 1}
            >
              −
            </button>
            <div className={styles.beansValue}>{beans}g</div>
            <button
              className={styles.btnIcon}
              onClick={() => setBeans(beans + 1)}
              aria-label={t("setup.increase")}
              disabled={beans >= 100}
            >
              ＋
            </button>
          </div>
        </div>
        <div className={styles.calculatedWater}>
          <span className={styles.calculatedWaterLabel}>{t("setup.water")}</span>
          <span className={styles.calculatedWaterValue}>{totalWater}g</span>
          <span className={styles.waterRatio}>1:{neoBrewMethod.waterRatio}</span>
        </div>
      </section>

      <button className={styles.btnPrimary} onClick={handleStart}>
        {t("setup.start")}
      </button>

      <details className="card" open={detailsOpen} onToggle={(e) => setDetailsOpen((e.target as HTMLDetailsElement).open)}>
        <summary className={styles.detailsSummary}>
          <span>{t("setup.details")}</span>
          <span className={styles.detailsSummaryLink}>
            {detailsOpen ? t("setup.closeAction") : t("setup.detailsAction")}
          </span>
        </summary>
        {detailsOpen && <div className={styles.detailsBody}>
          <section className={styles.preparation}>
            <h2>{t("setup.preparation")}</h2><p>{t("setup.prepHint")}</p>
            <p>{t("setup.scaleHint")}</p>
            <p>{t(startDelay ? "setup.startHint" : "setup.startImmediately")}</p>
            <span>{t("setup.overview")}</span>
          </section>
          <section aria-labelledby="pour-guide-heading">
            <h2 id="pour-guide-heading" className={styles.detailsSubTitle}>{t("setup.steps")}</h2>
            <p className={styles.detailsText}>{t("setup.recipeSummary")}</p>
            <ol className={styles.stepList}>
              {pourSteps.map((step, idx) => (
                <li key={step.timeSec} className={styles.stepItem}>
                  <span className={styles.stepNumber}>STEP {idx + 1}</span>
                  <span className={styles.stepInstruction}>
                    {t(step.actionType === "bloom" ? "setup.stepBloom" : "setup.stepPourTo", {
                      amount: step.cumulative,
                    })}
                  </span>
                  <span className={styles.stepDuration}>
                    {t("setup.stepDuration", {
                      seconds: neoBrewMethod.steps[idx + 1].timeSec - step.timeSec,
                    })}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="label-equipment">
            <div className={styles.equipmentHeader}>
              <h2 id="label-equipment" className={`card-title ${styles.equipmentTitle}`}>{t("setup.equipment")}</h2>
            </div>
            <ul className={styles.equipmentList}>
              {equipment.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            <p className={styles.affiliateDisclosure}>{t("setup.affiliate")}</p>
          </section>
        </div>}
      </details>

      {debugEnabled && (
        <>
          <section className="card">
            <div className="card-title">{t("setup.debugBgmDay")}</div>
            <div className="choice-row">
              {([
                { value: "sun", label: t("setup.daySun") },
                { value: "mon", label: t("setup.dayMon") },
                { value: "tue", label: t("setup.dayTue") },
                { value: "wed", label: t("setup.dayWed") },
                { value: "thu", label: t("setup.dayThu") },
                { value: "fri", label: t("setup.dayFri") },
                { value: "sat", label: t("setup.daySat") },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  className={`choice${debugBgmDayOfWeek === option.value ? " active" : ""}`}
                  onClick={() => setDebugBgmDayOfWeek(option.value as BgmDayOfWeek)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
          <section className="card">
            <CoffeeNews news={news} loading={newsLoading} />
          </section>
        </>
      )}

    </main>
  );
}

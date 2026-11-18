import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionStore } from "../../features/timer/store";
import { useSettingsStore } from "../../features/settings/store";
import type { BgmDayOfWeek } from "../../features/settings/types";
import { neoBrewMethod, computeSteps, formatTime, getTotalWater } from "../../features/recipe";
import { CoffeeNews } from "../../features/timer/components/CoffeeNews";
import { useCoffeeNews } from "../../features/timer/hooks/useCoffeeNews";
import { readBrewNote } from "../../features/timer/brewNote";
import styles from "./SetupPage.module.css";
import { getEquipmentItems, type SupportedLanguage } from "../../shared/affiliate/amazon";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { localizedPath } from "../../shared/i18n/routing";
import { RecipeVideo } from "../../shared/components/RecipeVideo";

export function SetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayLanguage = useDisplayLanguage();
  const [searchParams] = useSearchParams();
  const { beans, setBeans } = useSessionStore();
  const { debugEnabled, startDelay, debugBgmDayOfWeek, setDebugBgmDayOfWeek } = useSettingsStore();
  const { news, loading: newsLoading } = useCoffeeNews(displayLanguage, debugEnabled);
  const [doseInput, setDoseInput] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const beansParam = searchParams.get("beans");
    if (beansParam) {
      const n = Number(beansParam);
      if (Number.isFinite(n) && n > 0) setBeans(n);
    }
  }, [searchParams, setBeans]);

  const [previous] = useState(readBrewNote);
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
      <section className={styles.recipeCard}>
        <header className={styles.heading}>
          <h1>{t("setup.heading")}</h1>
          <p>{t("setup.overview")} · {t("setup.prepHint")}</p>
        </header>
        <div className={styles.recipeBody}>
          <div className={styles.stepperRow}>
            <label className={styles.beansLabel} htmlFor="bean-dose">{t("setup.beans")}</label>
            <div className={styles.stepperControls}>
              <button className={styles.btnIcon} onClick={() => setBeans(beans - 1)}
                aria-label={t("setup.decrease")} disabled={beans <= 1}>−</button>
              <div className={styles.beansValue}>
                <input id="bean-dose" type="text" inputMode="numeric" pattern="[0-9]*"
                  value={doseInput ?? beans} maxLength={3}
                  onFocus={event => event.currentTarget.select()}
                  onChange={event => {
                    const value = event.target.value;
                    if (!/^\d{0,3}$/.test(value)) return;
                    setDoseInput(value);
                    const dose = Number(value);
                    if (dose >= 1 && dose <= 100) setBeans(dose);
                  }}
                  onBlur={() => {
                    if (doseInput) setBeans(Number(doseInput));
                    setDoseInput(null);
                  }}
                  onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }}
                /><small>g</small>
              </div>
              <button className={styles.btnIcon} onClick={() => setBeans(beans + 1)}
                aria-label={t("setup.increase")} disabled={beans >= 100}>＋</button>
            </div>
          </div>
          <div className={styles.metrics} aria-live="polite">
            <div><span>{t("setup.water")}</span><strong>{totalWater}<small>g</small></strong></div>
            <div><span>{t("setup.firstPour")}</span><strong>{pourSteps[0].increment}<small>g</small></strong></div>
            <div><span>{t("setup.ratio")}</span><strong>1:{neoBrewMethod.waterRatio}</strong></div>
          </div>
          <button className={styles.btnPrimary} onClick={handleStart}>{t("setup.start")}</button>
        </div>
      </section>
      {previous && <section className={`card ${styles.noteCard}`}>
        <h2>{t("note.previous")}</h2>
        <span>{new Intl.DateTimeFormat(displayLanguage, { month: "short", day: "numeric" }).format(previous.savedAt)} · {previous.beans}g</span>
        <p>{previous.text}</p>
        {previous.beans !== beans && <button className="choice" onClick={() => setBeans(previous.beans)}>
          {t("note.useDose", { beans: previous.beans })}
        </button>}
      </section>}

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
            <table className={styles.schedule}>
              <thead><tr>
                {["setup.startTime", "setup.addWater", "setup.scale"].map(key => <th scope="col" key={key}>{t(key)}</th>)}
              </tr></thead>
              <tbody>{pourSteps.map(step => <tr key={step.timeSec}>
                <th scope="row">{formatTime(step.timeSec)}</th>
                <td>+{step.increment}g</td><td>{step.cumulative}g</td>
              </tr>)}</tbody>
            </table>
          </section>
          <RecipeVideo className={styles.detailsVideo} />
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

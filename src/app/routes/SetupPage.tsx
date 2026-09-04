import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionStore } from "../../features/timer/store";
import { useSettingsStore } from "../../features/settings/store";
import type { BgmDayOfWeek } from "../../features/settings/types";
import { neoBrewMethod, computeSteps, getTotalWater } from "../../features/recipe";
import type { FlavorProfile } from "../../features/recipe";
import { CoffeeNews } from "../../features/timer/components/CoffeeNews";
import { useCoffeeNews } from "../../features/timer/hooks/useCoffeeNews";
import styles from "./SetupPage.module.css";
import { getEquipmentItems, type SupportedLanguage } from "../../shared/affiliate/amazon";
const heroImage = "/assets/images/goran-ivos-1JsjRW6Sbwg-unsplash.jpg";

const validFlavors: FlavorProfile[] = ["sweet", "neutral", "sour"];

export function SetupPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beans, flavor, setBeans, setFlavor } = useSessionStore();
  const { debugEnabled, language, debugBgmDayOfWeek, setDebugBgmDayOfWeek } = useSettingsStore();
  const { news, loading: newsLoading } = useCoffeeNews(language, debugEnabled);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Apply URL parameters on mount (e.g. ?beans=25&flavor=sweet)
  useEffect(() => {
    const beansParam = searchParams.get("beans");
    if (beansParam) {
      const n = parseInt(beansParam, 10);
      if (!isNaN(n) && n > 0) setBeans(n);
    }
    const flavorParam = searchParams.get("flavor");
    if (flavorParam && validFlavors.includes(flavorParam as FlavorProfile)) {
      setFlavor(flavorParam as FlavorProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lang: SupportedLanguage = i18n.language === "ja" ? "ja" : "en";
  const totalWater = getTotalWater(beans, neoBrewMethod.waterRatio);
  const steps = computeSteps(neoBrewMethod, beans, flavor);
  const stepLabels: string[] = t("stepLabels", { returnObjects: true }) as string[];
  const equipment = getEquipmentItems(lang);

  const handleStart = () => {
    navigate("/timer?autostart=1");
  };

  return (
    <main className="content">
      <section className="card">
        <div className={styles.stepperRow}>
          <span className={styles.beansLabel}>{t("setup.beans")}</span>
          <button
            className={styles.btnIcon}
            onClick={() => setBeans(Math.max(1, beans - 1))}
            aria-label="decrease"
          >
            −
          </button>
          <div className={styles.beansValue}>{beans}g</div>
          <button
            className={styles.btnIcon}
            onClick={() => setBeans(beans + 1)}
            aria-label="increase"
          >
            ＋
          </button>
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
        <div className={styles.detailsBody}>
          <img
            className={styles.detailsImage}
            src={heroImage}
            alt="Neo Brew"
          />
          <div className={styles.detailsText}>{t("intro.description")}</div>
          <div>
            <div className={styles.detailsSubTitle}>{t("setup.steps")}</div>
            <div className={styles.stepList}>
              {steps
                .filter((step) => step.actionType !== "none")
                .map((step, idx) => (
                  <div key={`${step.timeSec}-${step.actionType}`} className={styles.stepItem}>
                    <span>
                      Step {idx + 1}: {stepLabels[idx] ?? ""}
                    </span>
                    <span>{step.cumulative}g</span>
                  </div>
                ))}
            </div>
          </div>
          <div className={styles.detailsVideo}>
            <iframe
              src="https://www.youtube.com/embed/k0nsShguOsU"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </details>

      <section className={`card ${styles.equipmentCard}`} aria-labelledby="label-equipment">
        <div className={styles.equipmentHeader}>
          <h2 className={`card-title ${styles.equipmentTitle}`}>{t("setup.equipment")}</h2>
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

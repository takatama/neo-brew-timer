import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionStore, normalizeBeans } from "../../features/timer/store";
import { useSettingsStore } from "../../features/settings/store";
import {
  neoBrewMethod,
  computeSteps,
  getTotalWater,
  formatTime,
} from "../../features/recipe";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { localizedPath } from "../../shared/i18n/routing";
import { getEquipmentItems } from "../../shared/affiliate/amazon";
import { RecipeVideo } from "../../shared/components/RecipeVideo";
import { BrewIllustration } from "../../shared/components/BrewIllustration";
import { Icon } from "../../shared/components/Icon";
import { VoicePreview } from "../../features/settings/VoicePreview";
import { primeVoiceAudio } from "../../features/timer/hooks/voiceAudio";
import { CoffeeReading } from "../../features/timer/components/CoffeeReading";
import styles from "./SetupPage.module.css";

export function SetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useDisplayLanguage();
  const [searchParams] = useSearchParams();
  const { beans, setBeans } = useSessionStore();
  const settings = useSettingsStore();
  const [draft, setDraft] = useState(String(beans));
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    setDraft(String(beans));
  }, [beans]);
  useEffect(() => {
    const value = searchParams.get("beans");
    if (value && Number.isFinite(Number(value))) setBeans(Number(value));
  }, [searchParams, setBeans]);
  const water = getTotalWater(beans, neoBrewMethod.waterRatio);
  const pours = computeSteps(neoBrewMethod, beans).filter(
    (step) => step.actionType !== "none",
  );
  const commitDraft = () => {
    const dose = normalizeBeans(Number(draft) || beans);
    setBeans(dose);
    setDraft(String(dose));
  };
  const start = () => {
    commitDraft();
    if (settings.isSoundEnabled()) primeVoiceAudio(language, settings.voice);
    navigate(localizedPath(language, "timer", "?autostart=1"));
  };
  return (
    <main className={`content ${styles.setup}`}>
      <section className={styles.hero}>
        <div>
          <p className="eyebrow">{t("experience.setupEyebrow")}</p>
          <h1>
            {t("experience.setupHeading")
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
          </h1>
          <p className={styles.heroHint}>{t("experience.setupLead")}</p>
        </div>
        <BrewIllustration animated className={styles.illustration} />
      </section>
      <section className={styles.recipeCard} aria-label={t("setup.heading")}>
        <div className={styles.doseHeader}>
          <label htmlFor="coffee-dose">{t("setup.beans")}</label>
          <span className="eyebrow">{t("experience.doseEyebrow")}</span>
        </div>
        <div className={styles.stepper}>
          <button
            type="button"
            onClick={() => setBeans(beans - 1)}
            disabled={beans <= 1}
            aria-label={t("setup.decrease")}
          >
            <Icon name="minus" />
          </button>
          <div className={styles.dose}>
            <input
              id="coffee-dose"
              aria-label={t("setup.beans")}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                const n = Number(event.target.value);
                if (Number.isInteger(n) && n >= 1 && n <= 100) setBeans(n);
              }}
              onBlur={commitDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitDraft();
                  event.currentTarget.blur();
                }
              }}
            />
            <span>g</span>
          </div>
          <button
            type="button"
            onClick={() => setBeans(beans + 1)}
            disabled={beans >= 100}
            aria-label={t("setup.increase")}
          >
            <Icon name="plus" />
          </button>
        </div>
        <div
          className={styles.presets}
          aria-label={t("experience.dosePresets")}
        >
          {[15, 20, 25, 30].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={beans === value}
              onClick={() => setBeans(value)}
            >
              {value}
              <span>g</span>
            </button>
          ))}
        </div>
        <div className={styles.waterSummary}>
          <div>
            <span>{t("setup.water")}</span>
            <strong>
              {water}
              <small>g</small>
            </strong>
          </div>
          <div>
            <span>{t("experience.ratio")}</span>
            <strong>
              1<small>:</small>15
            </strong>
          </div>
          <div>
            <span>{t("experience.pours")}</span>
            <strong>
              10<small>{t("experience.times")}</small>
            </strong>
          </div>
        </div>
      </section>
      <div className={styles.preparation}>
        <span>
          <Icon name="thermometer" size={16} />
          95–96°C
        </span>
        <span>
          <Icon name="bean" size={16} />
          {t("experience.grind")}
        </span>
        <span>≈ 3:30</span>
      </div>
      <section className={styles.voiceRow}>
        <button
          type="button"
          className={styles.voiceToggle}
          aria-pressed={settings.isSoundEnabled()}
          onClick={() => {
            if (!settings.isSoundEnabled())
              primeVoiceAudio(language, settings.voice);
            settings.toggleNotifyFlag("sound");
          }}
        >
          <Icon name={settings.isSoundEnabled() ? "sound" : "mute"} size={18} />
          <span>{t("experience.voiceGuide")}</span>
          <span
            className={styles.switch}
            data-on={settings.isSoundEnabled()}
            aria-hidden="true"
          />
        </button>
        <VoicePreview />
      </section>
      <div className={styles.startArea}>
        <p className={styles.scaleReminder}>
          <Icon name="check" size={15} />
          {t("experience.zeroScale")}
        </p>
        <button type="button" className="primary-button" onClick={start}>
          {t("setup.start")}
          <Icon name="arrow" size={21} />
        </button>
        <p className={styles.startHint}>
          {t(
            settings.startDelay ? "setup.startHint" : "setup.startImmediately",
          )}
        </p>
      </div>
      <details
        className={styles.guide}
        onToggle={(event) => setGuideOpen(event.currentTarget.open)}
      >
        <summary>
          <span>
            <Icon name="book" size={17} />
            {t("setup.details")}
          </span>
          <Icon name="chevron" size={18} />
        </summary>
        <div className={styles.guideBody}>
          <h2>{t("experience.recipeCredit")}</h2>
          <p>{t("setup.recipeSummary")}</p>
          <p className={styles.guideNote}>{t("setup.scaleHint")}</p>
          <h3>{t("intro.preparation")}</h3>
          <ul>
            {Object.keys(
              t("intro.preparationItems", { returnObjects: true }),
            ).map((key) => (
              <li key={key}>{t(`intro.preparationItems.${key}`)}</li>
            ))}
          </ul>
          <h3>{t("setup.steps")}</h3>
          <ol className={styles.schedule}>
            {pours.map((step, index) => (
              <li key={step.timeSec}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <time>{formatTime(step.timeSec)}</time>
                <strong>{step.cumulative}g</strong>
                <span>+{step.increment}g</span>
              </li>
            ))}
          </ol>
          <p className={styles.guideNote}>{t("experience.drawdownHint")}</p>
          {guideOpen && <RecipeVideo />}
          <h3>{t("setup.equipment")}</h3>
          <ul className={styles.equipment}>
            {getEquipmentItems(language).map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                >
                  {item.name}
                  <Icon name="external" size={13} />
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.disclosure}>{t("setup.affiliate")}</p>
        </div>
      </details>
      <CoffeeReading collapsible />
      <footer className={styles.credit}>
        {t("experience.recipeCredit")}
        <span>{t("experience.footerNote")}</span>
      </footer>
    </main>
  );
}

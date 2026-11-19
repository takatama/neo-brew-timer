import { useState } from "react";
import { computeSteps, formatTime, neoBrewMethod } from "../../features/recipe";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../../features/timer/store";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { localizedPath } from "../../shared/i18n/routing";
import { RecipeVideo } from "../../shared/components/RecipeVideo";
import styles from "./IntroPage.module.css";

const heroImage = "/assets/images/goran-ivos-1JsjRW6Sbwg-unsplash.jpg";

const samplePours = computeSteps(neoBrewMethod, 21).filter(step => step.actionType !== "none");

export function IntroPage() {
  const { t } = useTranslation();
  const [pourIndex, setPourIndex] = useState(0);
  const sample = samplePours[pourIndex];
  const navigate = useNavigate();
  const displayLanguage = useDisplayLanguage();
  const setIntroSeen = useSessionStore((state) => state.setIntroSeen);

  const handleContinue = () => {
    setIntroSeen(true);
    navigate(localizedPath(displayLanguage, "setup"));
  };

  return (
    <main className={`content ${styles.intro}`}>
      <section className={styles.hero} aria-labelledby="intro-heading">
        <img className={styles.heroImage} src={heroImage} alt="" width="2048" height="1365" />
        <div className={styles.heroText}>
          <p>{t("intro.recipeDescription")}</p>
          <h1 id="intro-heading" className={styles.heading}>{t("intro.heading")}</h1>
        </div>
      </section>
      <p className={styles.purpose}>{t("intro.purpose")}</p>
      <button type="button" className={styles.primaryButton} onClick={handleContinue}>
        {t("intro.continue")}
      </button>

      <section className={styles.sample} aria-labelledby="sample-heading">
        <h2 id="sample-heading" className={styles.sectionHeading}>{t("intro.sample")}</h2>
        <div className={styles.readout} aria-live="polite" aria-atomic="true">
          <div><span>{t("timer.pourCount", { current: pourIndex + 1, total: samplePours.length })} · {formatTime(sample.timeSec)}</span>
            <strong>{t("timer.targetAccessible", { amount: sample.cumulative })}</strong></div>
          <span>{t("timer.increment", { amount: sample.increment })}</span>
        </div>
        <button type="button" className="choice" onClick={() => setPourIndex((pourIndex + 1) % samplePours.length)}>
          {t(pourIndex === samplePours.length - 1 ? "intro.sampleReset" : "intro.sampleNext")}
        </button>
      </section>
      <section className={styles.preparation} aria-labelledby="preparation-heading">
        <h2 id="preparation-heading" className={styles.sectionHeading}>
          {t("intro.preparation")}
        </h2>
        <ul className={styles.preparationList}>
          <li>{t("intro.preparationItems.dripper")}</li>
          <li>{t("intro.preparationItems.tools")}</li>
          <li>{t("intro.preparationItems.coffee")}</li>
          <li>{t("intro.preparationItems.temperature")}</li>
        </ul>
        <div className={styles.calculationNote}>
          <p className={styles.example}>{t("intro.example")}</p>
        </div>
      </section>

      <RecipeVideo className={`card ${styles.videoCard}`} />
    </main>
  );
}

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../../features/timer/store";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { localizedPath } from "../../shared/i18n/routing";
import { RecipeVideo } from "../../shared/components/RecipeVideo";
import styles from "./IntroPage.module.css";

const heroImage = "/assets/images/goran-ivos-1JsjRW6Sbwg-unsplash.jpg";

export function IntroPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayLanguage = useDisplayLanguage();
  const setIntroSeen = useSessionStore((state) => state.setIntroSeen);

  const handleContinue = () => {
    setIntroSeen(true);
    navigate(localizedPath(displayLanguage, "setup"));
  };

  return (
    <main className={`content ${styles.intro}`}>
      <img
        className={styles.heroImage}
        src={heroImage}
        alt={t("intro.imageAlt")}
        width="2048"
        height="1365"
      />

      <section className={styles.introduction} aria-labelledby="intro-heading">
        <h1 id="intro-heading" className={styles.heading}>{t("intro.heading")}</h1>
        <p className={styles.lead}>
          {t("intro.valueDescriptionFirst")}<br />{t("intro.valueDescriptionSecond")}
        </p>
        <p className={styles.recipeDescription}>{t("intro.recipeDescription")}</p>
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

      <button type="button" className={styles.primaryButton} onClick={handleContinue}>
        {t("intro.continue")}
      </button>

      <RecipeVideo className={`card ${styles.videoCard}`} />
    </main>
  );
}

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { localizedPath } from "../../shared/i18n/routing";
import { RecipeVideo } from "../../shared/components/RecipeVideo";
import { BrewIllustration } from "../../shared/components/BrewIllustration";
import { Icon } from "../../shared/components/Icon";
import styles from "./IntroPage.module.css";
export function IntroPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useDisplayLanguage();
  return (
    <main className={`content ${styles.intro}`}>
      <BrewIllustration animated className={styles.hero} />
      <div className={styles.copy}>
        <p className="eyebrow">{t("experience.introEyebrow")}</p>
        <h1>{t("intro.heading")}</h1>
        <p>{t("experience.introLead")}</p>
        <small>{t("experience.recipeCredit")}</small>
      </div>
      <button
        className="primary-button"
        onClick={() => {
          navigate(localizedPath(language, "setup"));
        }}
      >
        {t("intro.continue")}
        <Icon name="arrow" />
      </button>
      <section className={styles.preparation}>
        <h2>{t("intro.preparation")}</h2>
        <ul>
          {["dripper", "tools", "coffee", "temperature"].map((key) => (
            <li key={key}>{t(`intro.preparationItems.${key}`)}</li>
          ))}
        </ul>
        <p>{t("intro.example")}</p>
      </section>
      <RecipeVideo />
    </main>
  );
}

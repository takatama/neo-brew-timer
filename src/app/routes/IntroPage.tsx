import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../../features/timer/store";
import styles from "./IntroPage.module.css";
const heroImage = "/assets/images/goran-ivos-1JsjRW6Sbwg-unsplash.jpg";

export function IntroPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setIntroSeen = useSessionStore((s) => s.setIntroSeen);

  const handleStart = () => {
    setIntroSeen(true);
    navigate("/setup");
  };

  return (
    <main className="content">
      <section className={`card ${styles.heroCard}`}>
        <img
          className={styles.heroImage}
          src={heroImage}
          alt="Neo Brew"
        />
        <div className={styles.heroTitle}>{t("intro.title")}</div>
        <div className={styles.heroDesc}>{t("intro.description")}</div>
      </section>

      <section className="card">
        <div className="card-title">{t("intro.youtube")}</div>
        <div className={styles.videoWrap}>
          <iframe
            src="https://www.youtube.com/embed/k0nsShguOsU"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.primary}`} onClick={handleStart}>
          {t("intro.start")}
        </button>
        <button className={`${styles.btn} ${styles.ghost}`} onClick={handleStart}>
          {t("intro.skip")}
        </button>
      </div>
    </main>
  );
}

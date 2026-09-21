import { useId } from "react";
import { useTranslation } from "react-i18next";
import styles from "./RecipeVideo.module.css";

interface RecipeVideoProps {
  className?: string;
}

export function RecipeVideo({ className }: RecipeVideoProps) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={className} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>{t("intro.videoHeading")}</h2>
      <div className={styles.frame}>
        <iframe
          src="https://www.youtube.com/embed/k0nsShguOsU"
          title={t("intro.videoTitle")}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}

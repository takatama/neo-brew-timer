import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDisplayLanguage } from "../../../shared/i18n/DisplayLanguage";
import { useCoffeeNews } from "../hooks/useCoffeeNews";
import { Icon } from "../../../shared/components/Icon";
import styles from "./CoffeeReading.module.css";
export function CoffeeReading({
  collapsible = false,
}: {
  collapsible?: boolean;
}) {
  const { t } = useTranslation();
  const language = useDisplayLanguage();
  const [opened, setOpened] = useState(false);
  const { news, loading } = useCoffeeNews(language, !collapsible || opened);
  const contents = (
    <div className={styles.articles}>
      {loading ? (
        <p role="status" className={styles.message}>
          {t("news.loading")}
        </p>
      ) : news.length ? (
        <ul>
          {news.slice(0, 3).map((item) => (
            <li key={item.id}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <div>
                  <span>{item.source}</span>
                  <strong>{item.short_title}</strong>
                </div>
                <Icon name="arrow" size={17} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.message}>{t("experience.noNews")}</p>
      )}
    </div>
  );
  if (collapsible)
    return (
      <details
        className={styles.reading}
        onToggle={(event) => {
          if (event.currentTarget.open) setOpened(true);
        }}
      >
        <summary>
          <span>
            <Icon name="cup" size={17} />
            {t("experience.readingTitle")}
          </span>
          <Icon name="chevron" size={18} />
        </summary>
        {opened && contents}
      </details>
    );
  return (
    <section className={styles.reading} aria-labelledby="reading-heading">
      <header>
        <h2 id="reading-heading">{t("experience.readingTitle")}</h2>
        <p>{t("experience.readingLead")}</p>
      </header>
      {contents}
    </section>
  );
}

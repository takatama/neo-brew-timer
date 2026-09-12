import { useTranslation } from "react-i18next";
import type { NewsItem } from "../hooks/useCoffeeNews";
import { CoffeeNews } from "./CoffeeNews";
import styles from "./FinishCard.module.css";

interface Props {
  news: NewsItem[];
  newsLoading: boolean;
}

export function FinishCard({
  news,
  newsLoading,
}: Props) {
  const { t } = useTranslation();

  return (
    <section className={`card ${styles.finishCard}`}>
      <div role="status">
      <h1 className={styles.stepVerb}>{t("timer.finish")}</h1>
      <div className={styles.stepSub}>{t("timer.enjoyCoffee")}</div>
      </div>
      {(newsLoading || news.length > 0) && <details className={styles.extras}><summary>{t("news.title")}</summary>
        <CoffeeNews news={news} loading={newsLoading} />
      </details>}
    </section>
  );
}

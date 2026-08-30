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
      <div className={styles.stepVerb}>{t("timer.finish")}</div>
      <div className={styles.stepSub}>{t("timer.enjoyCoffee")}</div>
      <div className={styles.extras}>
        <CoffeeNews news={news} loading={newsLoading} />
      </div>
    </section>
  );
}

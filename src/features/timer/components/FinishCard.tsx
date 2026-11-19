import { useState } from "react";
import { saveBrewNote } from "../brewNote";
import { useTranslation } from "react-i18next";
import type { NewsItem } from "../hooks/useCoffeeNews";
import { CoffeeNews } from "./CoffeeNews";
import styles from "./FinishCard.module.css";

interface Props {
  beans: number;
  news: NewsItem[];
  newsLoading: boolean;
}

export function FinishCard({
  beans,
  news,
  newsLoading,
}: Props) {
  const { t } = useTranslation();

  const [text, setText] = useState("");
  const [result, setResult] = useState<"saved" | "error" | null>(null);

  return (
    <section className={`card ${styles.finishCard}`}>
      <div role="status">
        <h1 className={styles.stepVerb}>{t("timer.finish")}</h1>
        <div className={styles.stepSub}>{t("timer.enjoyCoffee")}</div>
      </div>
      <details className={styles.extras}>
        <summary>{t("note.title")}</summary>
        <form className={styles.noteForm} onSubmit={event => {
          event.preventDefault();
          if (text.trim()) setResult(saveBrewNote(beans, text) ? "saved" : "error");
        }}>
          <label htmlFor="brew-note">{t("note.label")}</label>
          <textarea id="brew-note" rows={3} maxLength={400} value={text}
            placeholder={t("note.placeholder")} onChange={event => { setText(event.target.value); setResult(null); }} />
          <button className="choice" disabled={!text.trim() || result === "saved"}>{t("note.save")}</button>
          <span role="status">{result && t("note." + result)}</span>
        </form>
      </details>
      {(newsLoading || news.length > 0) && <details className={styles.extras}><summary>{t("news.title")}</summary>
        <CoffeeNews news={news} loading={newsLoading} />
      </details>}
    </section>
  );
}

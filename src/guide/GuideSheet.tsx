import { useTranslation } from "react-i18next";
import { useDisplayLanguage } from "../i18n/DisplayLanguage";
import { formatClock, planBrew } from "../brew/recipe";
import { Sheet } from "../ui/Sheet";
import { ExternalIcon } from "../ui/icons";
import { SHOP_ITEMS, shopUrl } from "./amazon";
import styles from "./GuideSheet.module.css";

const VIDEO_ID = "k0nsShguOsU";

export function GuideSheet({ open, onClose, beans }: { open: boolean; onClose: () => void; beans: number }) {
  const { t } = useTranslation();
  const language = useDisplayLanguage();
  const plan = planBrew(beans);

  return (
    <Sheet open={open} onClose={onClose} title={t("guide.title")} closeLabel={t("guide.close")}>
      <p className={styles.byline}>{t("guide.byline")}</p>
      <p className={styles.intro}>{t("guide.intro")}</p>

      <section className={styles.callout}>
        <h3 className={styles.calloutTitle}>{t("guide.numbersTitle")}</h3>
        <p>{t("guide.numbers")}</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.heading}>{t("guide.scheduleTitle", { beans })}</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t("guide.colTime")}</th>
              <th scope="col" />
              <th scope="col" className={styles.num}>{t("guide.colScale")}</th>
              <th scope="col" className={styles.num}>{t("guide.colAdd")}</th>
            </tr>
          </thead>
          <tbody>
            {plan.steps.map((step) => (
              <tr key={step.index} data-kind={step.kind}>
                <td className={styles.time}>{formatClock(step.atSec)}</td>
                <td className={styles.step}>
                  {step.kind === "bloom" ? t("guide.bloom") : step.kind === "finish" ? t("guide.finish") : `#${step.pour}`}
                </td>
                <td className={`${styles.num} ${styles.scale}`}>
                  {step.kind === "finish" ? "" : <>{step.target}<small>g</small></>}
                </td>
                <td className={`${styles.num} ${styles.add}`}>
                  {step.kind === "finish" ? "" : `+${step.amount}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h3 className={styles.heading}>{t("guide.needTitle")}</h3>
        <ul className={styles.shop}>
          {SHOP_ITEMS.map((item) => (
            <li key={item}>
              <a href={shopUrl(language, item)} target="_blank" rel="noopener noreferrer sponsored">
                <span>{t(`guide.items.${item}`)}</span>
                <ExternalIcon size={16} />
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.disclosure}>{t("guide.affiliate")}</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.heading}>{t("guide.videoTitle")}</h3>
        <div className={styles.video}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
            title={t("guide.videoFrameTitle")}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    </Sheet>
  );
}

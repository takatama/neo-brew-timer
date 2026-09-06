import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NewsItem } from "../hooks/useCoffeeNews";
import styles from "./CoffeeNews.module.css";
import { getNewsAdLinks, type SupportedLanguage } from "../../../shared/affiliate/amazon";
import { useDisplayLanguage } from "../../../shared/i18n/DisplayLanguage";

interface Props {
  news: NewsItem[];
  loading: boolean;
}

type AdKey = "filter" | "dripper" | "kettle" | "scale" | "grinder" | "canister";

interface AdItem {
  titleKey: string;
  descriptionKey: string;
  url: string;
}

const AD_CYCLE_KEY = "coco-timer-news-ad-cycle";
const NEWS_DISPLAY_LIMIT = 5;
const AD_ROTATION: AdKey[] = ["filter", "dripper", "kettle", "scale", "grinder", "canister"];

function pickAd(cycle: number, language: SupportedLanguage): AdItem | null {
  if (cycle % 2 !== 0) {
    return null;
  }

  const links = getNewsAdLinks(language);
  const rotationIndex = Math.floor((cycle - 1) / 2) % AD_ROTATION.length;
  const adKey = AD_ROTATION[rotationIndex];

  return {
    titleKey: `news.ads.${adKey}.title`,
    descriptionKey: `news.ads.${adKey}.description`,
    url: links[adKey],
  };
}

function nextAdCycle(): number {
  const raw = Number(localStorage.getItem(AD_CYCLE_KEY) ?? "0");
  const safe = Number.isFinite(raw) && raw > 0 ? raw : 0;
  const next = safe + 1;
  localStorage.setItem(AD_CYCLE_KEY, String(next));
  return next;
}

export function CoffeeNews({ news, loading }: Props) {
  const { t } = useTranslation();
  const displayLanguage = useDisplayLanguage();
  const [ad, setAd] = useState<AdItem | null>(null);

  const language: SupportedLanguage = displayLanguage;

  const adCycleSeed = useMemo(() => {
    if (loading || news.length === 0) {
      return null;
    }

    return `${language}:${news.map((item) => item.id).join(":")}`;
  }, [language, loading, news]);

  useEffect(() => {
    if (!adCycleSeed) {
      setAd(null);
      return;
    }

    setAd(pickAd(nextAdCycle(), language));
  }, [adCycleSeed, language]);

  if (loading) {
    return (
      <>
        <div className="card-title">{t("news.title")}</div>
        <div className="hint">{t("news.loading")}</div>
      </>
    );
  }

  if (news.length === 0) return null;

  const displayNews = news.slice(0, NEWS_DISPLAY_LIMIT);
  const canInsertAdAsFifth = Boolean(ad) && displayNews.length === NEWS_DISPLAY_LIMIT;

  return (
    <>
      <div className="card-title">{t("news.title")}</div>
      <ul className={styles.newsList}>
        {displayNews.map((item, index) => {
          if (canInsertAdAsFifth && index === NEWS_DISPLAY_LIMIT - 1 && ad) {
            return (
              <li key={`ad-${ad.titleKey}`}>
                <a
                  href={ad.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={styles.newsItem}
                >
                  <span className={styles.newsItemTitle}>
                    {t("news.ads.label")} {t(ad.titleKey)}
                  </span>
                  <span className={styles.newsItemSource}>{t(ad.descriptionKey)}</span>
                  <span className={styles.affiliateDisclosure}>{t("setup.affiliate")}</span>
                </a>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newsItem}
              >
                <span className={styles.newsItemTitle}>{item.short_title}</span>
                <span className={styles.newsItemSource}>{item.source}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}

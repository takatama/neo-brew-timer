import { useEffect, useState } from "react";
import type { Language } from "../../settings/types";

export interface NewsItem {
  id: string;
  short_title: string;
  url: string;
  source: string;
}

function decodeHtml(s: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
}

export function useCoffeeNews(language: Language, enabled = true) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    fetch(`https://daily-brew.takatama.workers.dev/news?lang=${language}`, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error("News unavailable"); return r.json(); })
      .then((data) => {
        if (!active) return;
        const items: NewsItem[] = (Array.isArray(data.items) ? data.items : []).filter((item: NewsItem) =>
          typeof item.short_title === "string" && typeof item.source === "string" && typeof item.url === "string" && /^https?:\/\//.test(item.url)
        ).map((item: NewsItem) => ({
          id: item.id,
          short_title: decodeHtml(item.short_title),
          url: item.url,
          source: decodeHtml(item.source),
        }));
        setNews(items);
        setLoading(false);
      })
      .catch(() => {
        if (active) { setNews([]); setLoading(false); }
      });
    return () => { active = false; controller.abort(); };
  }, [language, enabled]);

  return { news, loading };
}

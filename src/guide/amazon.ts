export type ShopLanguage = "ja" | "en";
export type ShopItem = "dripper" | "filter" | "scale" | "kettle" | "grinder" | "beans";

const KEYWORDS: Record<ShopLanguage, Record<ShopItem, string>> = {
  ja: {
    dripper: "V60ドリッパーNeo",
    filter: "V60 フィルター",
    scale: "コーヒー スケール",
    kettle: "コーヒー 電気ケトル",
    grinder: "コマンダンテ ミル",
    beans: "浅煎り コーヒー豆",
  },
  en: {
    dripper: "V60 Dripper Neo",
    filter: "V60 filters",
    scale: "coffee scale",
    kettle: "pour over electric kettle",
    grinder: "Comandante grinder",
    beans: "light roast coffee beans",
  },
};

const TAG: Record<ShopLanguage, string> = { ja: "tktm-22", en: "tktm-20" };
const BASE: Record<ShopLanguage, string> = {
  ja: "https://www.amazon.co.jp/s",
  en: "https://www.amazon.com/s",
};
/** Restrict results to items sold by Amazon itself. */
const SELLER: Record<ShopLanguage, string> = { ja: "AN1VRQENFRJN5", en: "ATVPDKIKX0DER" };

export function amazonSearchUrl(language: ShopLanguage, query: string): string {
  const params = new URLSearchParams({
    k: query.replace(/\s+/g, "+"),
    rh: `p_6:${SELLER[language]}`,
    tag: TAG[language],
  });
  return `${BASE[language]}?${params.toString().replace(/%2B/g, "+")}`;
}

export const SHOP_ITEMS: readonly ShopItem[] = ["dripper", "filter", "scale", "kettle", "grinder", "beans"];

export function shopUrl(language: ShopLanguage, item: ShopItem): string {
  return amazonSearchUrl(language, KEYWORDS[language][item]);
}

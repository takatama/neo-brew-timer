export type SupportedLanguage = "ja" | "en";

interface EquipmentItem {
  name: string;
  href: string;
}

type ItemKind = "filter" | "dripper" | "kettle" | "scale" | "grinder" | "comandante" | "canister";

type NewsAdKind = Exclude<ItemKind, "comandante">;

type NewsAdLinks = Record<NewsAdKind, string>;

const AMAZON_SEARCH_KEYWORDS: Record<SupportedLanguage, Record<ItemKind, string>> = {
  ja: {
    dripper: "V60ドリッパーNeo",
    filter: "V60 フィルター",
    scale: "コーヒー スケール",
    kettle: "コーヒー 電気ケトル",
    grinder: "コーヒーグラインダー 臼式",
    comandante: "コマンダンテ ミル",
    canister: "コーヒー キャニスター",
  },
  en: {
    dripper: "V60 Dripper Neo",
    filter: "V60 filters",
    scale: "coffee scale",
    kettle: "pour over electric kettle",
    grinder: "burr coffee grinder",
    comandante: "Comandante grinder",
    canister: "coffee bean canister",
  },
};

const AMAZON_ASSOCIATE_TAG: Record<SupportedLanguage, string> = {
  ja: "tktm-22",
  en: "tktm-20",
};

const AMAZON_BASE_URL: Record<SupportedLanguage, string> = {
  ja: "https://www.amazon.co.jp/s",
  en: "https://www.amazon.com/s",
};

const AMAZON_SELLER_FILTER: Record<SupportedLanguage, string> = {
  ja: "AN1VRQENFRJN5",
  en: "ATVPDKIKX0DER",
};

const AMAZON_EXTRA_PARAMS: Record<SupportedLanguage, Record<string, string>> = {
  ja: {
    rh: `p_6:${AMAZON_SELLER_FILTER.ja}`,
  },
  en: {
    rh: `p_6:${AMAZON_SELLER_FILTER.en}`,
  },
};

export function buildAmazonSearchUrl(language: SupportedLanguage, query: string): string {
  const baseUrl = AMAZON_BASE_URL[language];
  const tag = AMAZON_ASSOCIATE_TAG[language];
  const params = new URLSearchParams({
    k: query.replace(/\s+/g, "+"),
    ...AMAZON_EXTRA_PARAMS[language],
    tag,
  });
  return `${baseUrl}?${params.toString().replace(/%2B/g, "+")}`;
}

export function getEquipmentItems(language: SupportedLanguage): EquipmentItem[] {
  if (language === "ja") {
    return [
      { name: "V60ドリッパーNeo", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.dripper) },
      { name: "V60 フィルター", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.filter) },
      { name: "スケール", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.scale) },
      { name: "ケトル", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.kettle) },
      { name: "グラインダー / ミル", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.comandante) },
      { name: "キャニスター", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.canister) },
    ];
  }

  return [
    { name: "V60 Dripper Neo", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.dripper) },
    { name: "V60 Filters", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.filter) },
    { name: "Coffee Scale", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.scale) },
    { name: "Pour-over kettle", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.kettle) },
    { name: "Grinder / Mill", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.comandante) },
    { name: "Bean canister", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.canister) },
  ];
}

export function getNewsAdLinks(language: SupportedLanguage): NewsAdLinks {
  const keywords = AMAZON_SEARCH_KEYWORDS[language];

  return {
    filter: buildAmazonSearchUrl(language, keywords.filter),
    dripper: buildAmazonSearchUrl(language, keywords.dripper),
    kettle: buildAmazonSearchUrl(language, keywords.kettle),
    scale: buildAmazonSearchUrl(language, keywords.scale),
    grinder: buildAmazonSearchUrl(language, keywords.grinder),
    canister: buildAmazonSearchUrl(language, keywords.canister),
  };
}

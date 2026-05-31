export type SupportedLanguage = "ja" | "en";

interface EquipmentItem {
  name: string;
  href: string;
}

type ItemKind = "filter" | "dripper" | "kettle" | "scale" | "grinder" | "canister";

type NewsAdKind = ItemKind;

type NewsAdLinks = Record<NewsAdKind, string>;

const AMAZON_SEARCH_KEYWORDS: Record<SupportedLanguage, Record<ItemKind, string>> = {
  ja: {
    dripper: "V60 ドリッパー",
    filter: "V60 フィルター",
    scale: "コーヒー スケール",
    kettle: "コーヒー 電気ケトル",
    grinder: "コーヒーグラインダー 臼式",
    canister: "コーヒー キャニスター",
  },
  en: {
    dripper: "V60 dripper",
    filter: "V60 filters",
    scale: "coffee scale",
    kettle: "pour over electric kettle",
    grinder: "burr coffee grinder",
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

function toUrlQuery(query: string): string {
  return encodeURIComponent(query);
}

export function buildAmazonSearchUrl(language: SupportedLanguage, query: string): string {
  const baseUrl = AMAZON_BASE_URL[language];
  const tag = AMAZON_ASSOCIATE_TAG[language];
  return `${baseUrl}?k=${toUrlQuery(query)}&tag=${tag}`;
}

export function getEquipmentItems(language: SupportedLanguage): EquipmentItem[] {
  if (language === "ja") {
    return [
      { name: "V60 ドリッパー", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.dripper) },
      { name: "V60 フィルター", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.filter) },
      { name: "スケール", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.scale) },
      { name: "ケトル", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.kettle) },
      { name: "キャニスター", href: buildAmazonSearchUrl("ja", AMAZON_SEARCH_KEYWORDS.ja.canister) },
    ];
  }

  return [
    { name: "V60 Dripper", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.dripper) },
    { name: "V60 Filters", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.filter) },
    { name: "Coffee Scale", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.scale) },
    { name: "Pour-over kettle", href: buildAmazonSearchUrl("en", AMAZON_SEARCH_KEYWORDS.en.kettle) },
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

export const supportedLanguages = ["ja", "en"] as const;
export type DisplayLanguage = (typeof supportedLanguages)[number];

export type AppPage = "prepare" | "brew";

/** Earlier URLs keep working: intro and setup became Prepare; timer became Brew. */
const PAGE_ALIASES: Record<string, AppPage> = {
  "": "prepare",
  prepare: "prepare",
  setup: "prepare",
  intro: "prepare",
  brew: "brew",
  timer: "brew",
};

export function isDisplayLanguage(value: unknown): value is DisplayLanguage {
  return value === "ja" || value === "en";
}

export function getUrlLanguage(pathname: string): DisplayLanguage | null {
  const [language] = pathname.split("/").filter(Boolean);
  return isDisplayLanguage(language) ? language : null;
}

export function choosePreferredLanguage(saved: unknown, browser: string | undefined): DisplayLanguage {
  if (isDisplayLanguage(saved)) return saved;
  if (browser?.toLowerCase().startsWith("ja")) return "ja";
  return "en";
}

export function localizedPath(language: DisplayLanguage, page: AppPage, search = "", hash = ""): string {
  return `/${language}${page === "brew" ? "/brew" : ""}${search}${hash}`;
}

export interface RouteResolution {
  language: DisplayLanguage;
  page: AppPage;
  redirectTo: string | null;
}

export function resolveRoute(
  pathname: string,
  search: string,
  hash: string,
  preferred: DisplayLanguage,
): RouteResolution {
  const segments = pathname.split("/").filter(Boolean);
  let language = preferred;
  let rest = segments;
  if (isDisplayLanguage(segments[0])) {
    language = segments[0];
    rest = segments.slice(1);
  }
  const page = rest.length <= 1 ? PAGE_ALIASES[rest[0] ?? ""] ?? "prepare" : "prepare";
  const canonical = localizedPath(language, page);
  return {
    language,
    page,
    redirectTo: pathname === canonical ? null : `${canonical}${search}${hash}`,
  };
}

export function switchLanguage(pathname: string, language: DisplayLanguage, search = "", hash = ""): string {
  const { page } = resolveRoute(pathname, "", "", language);
  return localizedPath(language, page, search, hash);
}

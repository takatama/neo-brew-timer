export const supportedLanguages = ["ja", "en"] as const;
export type DisplayLanguage = (typeof supportedLanguages)[number];

export const appPages = ["intro", "setup", "timer"] as const;
export type AppPage = (typeof appPages)[number];

export function isDisplayLanguage(value: unknown): value is DisplayLanguage {
  return value === "ja" || value === "en";
}

export function isAppPage(value: unknown): value is AppPage {
  return value === "intro" || value === "setup" || value === "timer";
}

function pathSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

export function getUrlLanguage(pathname: string): DisplayLanguage | null {
  const [language] = pathSegments(pathname);
  return isDisplayLanguage(language) ? language : null;
}

export function choosePreferredLanguage(
  savedLanguage: unknown,
  browserLanguage: string | undefined,
): DisplayLanguage {
  if (isDisplayLanguage(savedLanguage)) return savedLanguage;
  if (browserLanguage?.toLowerCase().startsWith("ja")) return "ja";
  return "en";
}

function defaultPage(introSeen: boolean): AppPage {
  return introSeen ? "setup" : "intro";
}

export interface AppRouteResolution {
  language: DisplayLanguage;
  page: AppPage;
  redirectTo: string | null;
}

export function resolveAppRoute(
  pathname: string,
  search: string,
  hash: string,
  preferredLanguage: DisplayLanguage,
  introSeen: boolean,
): AppRouteResolution {
  const segments = pathSegments(pathname);
  const first = segments[0];
  const second = segments[1];
  let language = preferredLanguage;
  let page = defaultPage(introSeen);

  if (isDisplayLanguage(first)) {
    language = first;
    if (segments.length === 2 && isAppPage(second)) page = second;
  } else if (segments.length === 1 && isAppPage(first)) {
    page = first;
  } else if (segments.length === 2 && isAppPage(second)) {
    page = second;
  }

  const canonicalPath = `/${language}/${page}`;
  const isCanonical = pathname === canonicalPath;
  return {
    language,
    page,
    redirectTo: isCanonical ? null : `${canonicalPath}${search}${hash}`,
  };
}

export function localizedPath(
  language: DisplayLanguage,
  page: AppPage,
  search = "",
  hash = "",
): string {
  return `/${language}/${page}${search}${hash}`;
}

export function replacePathLanguage(
  pathname: string,
  language: DisplayLanguage,
  search = "",
  hash = "",
): string {
  const segments = pathSegments(pathname);
  const page = isDisplayLanguage(segments[0]) && isAppPage(segments[1])
    ? segments[1]
    : "setup";
  return localizedPath(language, page, search, hash);
}

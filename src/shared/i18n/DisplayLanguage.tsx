import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";
import i18n from "./config";
import type { DisplayLanguage } from "./routing";

const DisplayLanguageContext = createContext<DisplayLanguage | null>(null);

export function DisplayLanguageProvider({
  language,
  children,
}: {
  language: DisplayLanguage;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  return (
    <DisplayLanguageContext.Provider value={language}>
      {children}
    </DisplayLanguageContext.Provider>
  );
}

export function useDisplayLanguage(): DisplayLanguage {
  const language = useContext(DisplayLanguageContext);
  if (!language) throw new Error("DisplayLanguageProvider is missing");
  return language;
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "./ja.json";
import en from "./en.json";

const defaultLang =
  typeof navigator !== "undefined" && navigator.language.startsWith("ja")
    ? "ja"
    : "en";

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: defaultLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = i18n.language;
i18n.on("languageChanged", (language) => { document.documentElement.lang = language; });

export default i18n;

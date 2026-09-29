import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import i18n from "./i18n/config";
import { choosePreferredLanguage, getUrlLanguage } from "./i18n/routing";
import { SETTINGS_KEY } from "./settings/store";
import { App } from "./app/App";
import "./styles/global.css";

function savedLanguage(): unknown {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored).state?.language : undefined;
  } catch {
    return undefined;
  }
}

const language = getUrlLanguage(window.location.pathname)
  ?? choosePreferredLanguage(savedLanguage(), navigator.language);
await i18n.changeLanguage(language);

// Give the display face a brief moment so the first numbers don't swap fonts.
if (document.fonts?.load) {
  await Promise.race([
    document.fonts.load('500 100px "Fraunces"', "0123456789g"),
    new Promise((resolve) => setTimeout(resolve, 350)),
  ]).catch(() => undefined);
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import i18n from "./shared/i18n/config";
import { choosePreferredLanguage, getUrlLanguage } from "./shared/i18n/routing";
import { App } from "./app/App";
import "./shared/styles/tokens.css";

let savedLanguage: unknown;
try {
  const stored = localStorage.getItem("coco-timer-settings");
  if (stored) {
    const parsed = JSON.parse(stored);
    savedLanguage = parsed.state?.language;
  }
} catch {
  // Use the browser language when saved settings cannot be read.
}

const initialLanguage = getUrlLanguage(window.location.pathname)
  ?? choosePreferredLanguage(savedLanguage, navigator.language);

await i18n.changeLanguage(initialLanguage);

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

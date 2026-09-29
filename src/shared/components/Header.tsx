import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsModal } from "../../features/settings/SettingsModal";
import { useSettingsStore } from "../../features/settings/store";
import { Icon } from "./Icon";
import { primeVoiceAudio } from "../../features/timer/hooks/voiceAudio";
import { useDisplayLanguage } from "../i18n/DisplayLanguage";
import styles from "./Header.module.css";
export function Header({ brewing = false }: { brewing?: boolean }) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settings = useSettingsStore();
  const language = useDisplayLanguage();
  const sound = settings.isSoundEnabled();
  return (
    <>
      <header className={styles.appBar}>
        <div className={styles.appTitle} aria-label={t("app.title")}>
          <svg
            width="27"
            height="31"
            viewBox="0 0 30 34"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden="true"
          >
            <path
              d="M4 11h22L17 24h-4L4 11ZM9 25h12M7 29h16M15 4v3M10 2v4M20 2v4"
              strokeLinecap="round"
            />
            <path d="m9 13 5 8m7-8-5 8" opacity=".5" />
          </svg>
          <div>
            <span className={styles.wordmark}>neo brew</span>
            <span className={styles.subtitle}>A LITTLE DAILY RITUAL</span>
          </div>
        </div>
        <div className={styles.actions}>
          {brewing && (
            <button
              className={styles.iconBtn}
              aria-label={t(sound ? "experience.mute" : "experience.unmute")}
              aria-pressed={sound}
              onClick={() => {
                if (!sound) primeVoiceAudio(language, settings.voice);
                settings.toggleNotifyFlag("sound");
              }}
            >
              <Icon name={sound ? "sound" : "mute"} size={19} />
            </button>
          )}
          <button
            className={styles.iconBtn}
            onClick={() => setSettingsOpen(true)}
            aria-label={t("settings.title")}
          >
            <Icon name="settings" />
          </button>
        </div>
      </header>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

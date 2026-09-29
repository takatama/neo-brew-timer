import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useDisplayLanguage } from "../i18n/DisplayLanguage";
import { switchLanguage, type DisplayLanguage } from "../i18n/routing";
import { canVibrate } from "../cues";
import { cues } from "../brew/session";
import { pause as pauseMusic } from "../music/player";
import { Sheet } from "../ui/Sheet";
import { Segmented, Switch } from "../ui/controls";
import { useSettings, type CueSound, type Voice } from "./store";
import styles from "./SettingsSheet.module.css";

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const language = useDisplayLanguage();
  const s = useSettings();

  const changeLanguage = (next: DisplayLanguage) => {
    s.setLanguage(next);
    navigate(switchLanguage(location.pathname, next, location.search, location.hash), { replace: true });
  };

  return (
    <Sheet open={open} onClose={onClose} title={t("settings.title")} closeLabel={t("settings.close")}>
      <section className={styles.section}>
        <h3 className={styles.heading}>{t("settings.language")}</h3>
        <Segmented
          label={t("settings.language")}
          value={language}
          onChange={changeLanguage}
          options={[
            { value: "ja", label: "日本語" },
            { value: "en", label: "English" },
          ]}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.heading}>{t("settings.cue")}</h3>
        <Segmented<CueSound>
          label={t("settings.cue")}
          value={s.sound}
          onChange={(sound) => {
            s.setSound(sound);
            cues.unlock();
            void cues.warm();
          }}
          options={[
            { value: "voice", label: t("settings.voice") },
            { value: "chime", label: t("settings.chime") },
            { value: "off", label: t("settings.off") },
          ]}
        />
        {s.sound === "voice" && (
          <div className={styles.sub}>
            <span className={styles.subLabel}>{t("settings.voiceType")}</span>
            <Segmented<Voice>
              compact
              label={t("settings.voiceType")}
              value={s.voice}
              onChange={s.setVoice}
              options={[
                { value: "male", label: t("settings.male") },
                { value: "female", label: t("settings.female") },
              ]}
            />
          </div>
        )}
        <div className={styles.cueFoot}>
          <p className={styles.hint}>{t("settings.cueHint")}</p>
          {s.sound !== "off" && (
            <button type="button" className={styles.sample} onClick={() => cues.sample()}>
              {t("settings.sample")}
            </button>
          )}
        </div>
        {canVibrate && (
          <Switch id="settings-vibrate" label={t("settings.vibrate")} checked={s.vibrate} onChange={s.setVibrate} />
        )}
      </section>

      <section className={styles.section}>
        <Switch
          id="settings-countdown"
          label={t("settings.countdown")}
          checked={s.countdown}
          onChange={s.setCountdown}
        />
        <Switch
          id="settings-music"
          label={t("settings.music")}
          hint={t("settings.musicHint")}
          checked={s.music}
          onChange={(music) => {
            s.setMusic(music);
            if (!music) pauseMusic();
          }}
        />
      </section>

      <section className={`${styles.section} ${styles.developer}`}>
        <h3 className={styles.heading}>{t("settings.developer")}</h3>
        <Switch
          id="settings-speed"
          label={t("settings.speed")}
          checked={s.speed === 5}
          onChange={(fast) => s.setSpeed(fast ? 5 : 1)}
        />
      </section>
    </Sheet>
  );
}

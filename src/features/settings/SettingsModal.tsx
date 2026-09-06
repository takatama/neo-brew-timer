import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useSettingsStore } from "./store";
import type { Voice } from "./types";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { replacePathLanguage, type DisplayLanguage } from "../../shared/i18n/routing";
import styles from "./SettingsModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

function SegmentedControl<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
  disabled = false,
}: {
  ariaLabel: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (nextValue: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className={styles.segmented} role="radiogroup" aria-label={ariaLabel} aria-disabled={disabled}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={styles.segmentButton}
          data-active={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SwitchRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
}) {
  return (
    <label className={styles.row} htmlFor={id}>
      <span className={styles.rowLabel}>{label}</span>
      <input
        id={id}
        className={styles.switch}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function SettingsModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const displayLanguage = useDisplayLanguage();
  const settings = useSettingsStore();

  const soundEnabled = settings.isSoundEnabled();
  const vibrateEnabled = settings.isVibrateEnabled();

  const handleLanguageChange = (lang: DisplayLanguage) => {
    settings.setLanguage(lang);
    navigate(
      replacePathLanguage(location.pathname, lang, location.search, location.hash),
      { replace: true },
    );
  };

  if (!open) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="settings-modal-title" className={styles.modalTitle}>
          {t("settings.title")}
        </h3>

        <section className={styles.section} aria-labelledby="settings-language-heading">
          <h4 id="settings-language-heading" className={styles.sectionTitle}>
            {t("settings.language")}
          </h4>
          <SegmentedControl
            ariaLabel={t("settings.language")}
            value={displayLanguage}
            onChange={handleLanguageChange}
            options={[
              { value: "ja", label: "日本語" },
              { value: "en", label: "English" },
            ]}
          />
        </section>

        <section className={styles.section} aria-labelledby="settings-notification-heading">
          <h4 id="settings-notification-heading" className={styles.sectionTitle}>
            {t("settings.notification")}
          </h4>

          <SwitchRow
            id="settings-sound"
            label={t("settings.notifySound")}
            checked={soundEnabled}
            onChange={() => settings.toggleNotifyFlag("sound")}
          />

          <div className={styles.dependentGroup} aria-disabled={!soundEnabled}>
            <div className={styles.rowLabel}>{t("settings.voice")}</div>
            <SegmentedControl
              ariaLabel={t("settings.voice")}
              value={settings.voice}
              disabled={!soundEnabled}
              onChange={(voice) => settings.setVoice(voice as Voice)}
              options={[
                { value: "male", label: t("settings.voiceMale") },
                { value: "female", label: t("settings.voiceFemale") },
              ]}
            />
          </div>

          <SwitchRow
            id="settings-vibrate"
            label={t("settings.notifyVibrate")}
            checked={vibrateEnabled}
            onChange={() => settings.toggleNotifyFlag("vibrate")}
          />

          <p className={styles.hint}>{t("settings.notificationHint")}</p>
        </section>

        <section className={styles.section} aria-labelledby="settings-display-heading">
          <h4 id="settings-display-heading" className={styles.sectionTitle}>
            {t("settings.display")}
          </h4>
          <SwitchRow
            id="settings-bgm"
            label={t("settings.bgm")}
            checked={settings.bgmEnabled}
            onChange={settings.setBgmEnabled}
          />
          <SwitchRow
            id="settings-animation"
            label={t("settings.animation")}
            checked={settings.animation}
            onChange={settings.setAnimation}
          />
        </section>

        <section className={styles.section} aria-labelledby="settings-developer-heading">
          <h4 id="settings-developer-heading" className={styles.sectionTitle}>
            {t("settings.developer")}
          </h4>
          <SwitchRow
            id="settings-debug"
            label={t("settings.debug")}
            checked={settings.debugEnabled}
            onChange={settings.setDebugEnabled}
          />
          <p className={styles.hint}>{t("settings.debugHint")}</p>
        </section>

        <div className={styles.actions}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            {t("settings.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

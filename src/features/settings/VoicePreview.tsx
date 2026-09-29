import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { useSettingsStore } from "./store";
import { Icon } from "../../shared/components/Icon";
import styles from "./VoicePreview.module.css";
export function VoicePreview() {
  const { t } = useTranslation();
  const language = useDisplayLanguage();
  const voice = useSettingsStore((state) => state.voice);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    setPlaying(false);
    setFailed(false);
    const audio = new Audio(
      `/assets/audio/${language}-${voice}-first-step.wav`,
    );
    audioRef.current = audio;
    const ended = () => setPlaying(false);
    audio.addEventListener("ended", ended);
    return () => {
      audio.pause();
      audio.removeEventListener("ended", ended);
      audioRef.current = null;
    };
  }, [language, voice]);
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    setFailed(false);
    audio.currentTime = 0;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        setFailed(true);
        setPlaying(false);
      });
  };
  return (
    <div className={styles.preview}>
      <button
        type="button"
        onClick={toggle}
        aria-label={t(
          playing ? "experience.stopPreview" : "experience.previewVoice",
        )}
      >
        <Icon name={playing ? "pause" : "play"} size={14} />
        {t(playing ? "experience.stopPreview" : "experience.previewVoice")}
      </button>
      {failed && <span role="status">{t("experience.audioUnavailable")}</span>}
    </div>
  );
}

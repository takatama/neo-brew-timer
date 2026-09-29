import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDisplayLanguage } from "../../shared/i18n/DisplayLanguage";
import { useSettingsStore } from "./store";
import { Icon } from "../../shared/components/Icon";
import styles from "./VoicePreview.module.css";
export function VoicePreview() {
  const { t } = useTranslation();
  const language = useDisplayLanguage();
  const voice = useSettingsStore((state) => state.voice);
  const soundEnabled = useSettingsStore((state) => state.isSoundEnabled());
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackId = useRef(0);
  const stop = useCallback(() => {
    playbackId.current += 1;
    audioRef.current?.pause();
    setPlaying(false);
    setFailed(false);
  }, []);
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
      playbackId.current += 1;
      audio.pause();
      audio.removeEventListener("ended", ended);
      audioRef.current = null;
    };
  }, [language, voice]);
  useEffect(() => {
    if (!soundEnabled) stop();
  }, [soundEnabled, stop]);
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      stop();
      return;
    }
    const id = ++playbackId.current;
    setFailed(false);
    setPlaying(true);
    audio.currentTime = 0;
    void audio.play().catch(() => {
      if (playbackId.current !== id || audioRef.current !== audio) return;
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

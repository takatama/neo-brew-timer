import { useTranslation } from "react-i18next";
import { toggleMusic, useMusic } from "../music/player";
import { MusicIcon } from "./icons";
import styles from "./MusicButton.module.css";

export function MusicButton() {
  const { t } = useTranslation();
  const playing = useMusic((s) => s.playing);
  const loading = useMusic((s) => s.loading);
  const title = useMusic((s) => s.track?.title);
  return (
    <button
      type="button"
      className={styles.button}
      data-playing={playing || undefined}
      data-loading={loading || undefined}
      onClick={toggleMusic}
      aria-label={playing ? t("brew.musicPause") : t("brew.musicPlay")}
      aria-pressed={playing}
      title={title}
    >
      <MusicIcon size={20} />
      <span className={styles.bars} aria-hidden="true">
        <i /><i /><i />
      </span>
    </button>
  );
}

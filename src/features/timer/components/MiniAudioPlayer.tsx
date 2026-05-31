import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AudioTrack } from "../data/bgm";
import {
  VOICE_NOTIFICATION_END_EVENT,
  VOICE_NOTIFICATION_EVENT,
} from "../hooks/useNotification";
import styles from "./MiniAudioPlayer.module.css";

const DEFAULT_BGM_VOLUME = 1;
const DUCKED_BGM_VOLUME = 0.3;

interface MiniAudioPlayerProps {
  track: AudioTrack;
  className?: string;
  autoPlay?: boolean;
  onNextTrack?: (trigger: "manual" | "ended") => void;
  onTrackPlaybackStarted?: () => void;
}

interface IconProps {
  size?: number;
  strokeWidth?: number;
}

function PlayIcon({ size = 18, strokeWidth = 2.4 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <polygon
        points="6 3 20 12 6 21 6 3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PauseIcon({ size = 18, strokeWidth = 2.4 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="16" y1="4" x2="16" y2="20" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

function SkipForwardIcon({ size = 18, strokeWidth = 2.4 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <polygon
        points="5 4 15 12 5 20 5 4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function MiniAudioPlayer({
  track,
  className,
  autoPlay = false,
  onNextTrack,
  onTrackPlaybackStarted,
}: MiniAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const isPlayingRef = useRef(false);
  const onNextTrackRef = useRef(onNextTrack);
  const onTrackPlaybackStartedRef = useRef(onTrackPlaybackStarted);
  const activeVoicePlaybackCountRef = useRef(0);

  const restoreVolume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = DEFAULT_BGM_VOLUME;
  }, []);

  const duckVolumeTemporarily = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused || audio.ended) {
      return;
    }

    activeVoicePlaybackCountRef.current += 1;
    audio.volume = DUCKED_BGM_VOLUME;
  }, []);

  const handleVoiceNotificationCompleted = useCallback(() => {
    activeVoicePlaybackCountRef.current = Math.max(0, activeVoicePlaybackCountRef.current - 1);

    if (activeVoicePlaybackCountRef.current === 0) {
      restoreVolume();
    }
  }, [restoreVolume]);

  const tryPlayAudio = useCallback(async (audio: HTMLAudioElement, errorLabel: string) => {
    setIsBuffering(true);

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error(errorLabel, error);
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    onNextTrackRef.current = onNextTrack;
  }, [onNextTrack]);

  useEffect(() => {
    onTrackPlaybackStartedRef.current = onTrackPlaybackStarted;
  }, [onTrackPlaybackStarted]);

  const handlePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    await tryPlayAudio(audio, "[MiniAudioPlayer] Failed to play audio");
  }, [tryPlayAudio]);

  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  const handleNext = useCallback(() => {
    const nextTrackHandler = onNextTrackRef.current;
    if (!nextTrackHandler) {
      return;
    }

    nextTrackHandler("manual");
  }, []);

  useEffect(() => {
    const audio = new Audio(track.audioUrl);
    audio.preload = "metadata";
    audio.volume = DEFAULT_BGM_VOLUME;

    const handleEnded = () => {
      const nextTrackHandler = onNextTrackRef.current;
      if (!nextTrackHandler) {
        setIsPlaying(false);
        setIsBuffering(false);
        return;
      }

      setIsPlaying(true);
      setIsBuffering(true);
      nextTrackHandler("ended");
    };

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      onTrackPlaybackStartedRef.current?.();
    };

    const handleWaiting = () => {
      if (isPlayingRef.current) {
        setIsBuffering(true);
      }
    };

    const handlePause = () => {
      if (!audio.ended) {
        setIsBuffering(false);
      }
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("pause", handlePause);
    audioRef.current = audio;

    if (isPlayingRef.current || autoPlay) {
      void tryPlayAudio(audio, "[MiniAudioPlayer] Failed to resume audio");
    }

    return () => {
      restoreVolume();
      activeVoicePlaybackCountRef.current = 0;
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("pause", handlePause);
      audioRef.current = null;
    };
  }, [autoPlay, restoreVolume, track.audioUrl, tryPlayAudio]);

  useEffect(() => {
    window.addEventListener(VOICE_NOTIFICATION_EVENT, duckVolumeTemporarily);
    window.addEventListener(VOICE_NOTIFICATION_END_EVENT, handleVoiceNotificationCompleted);

    return () => {
      window.removeEventListener(VOICE_NOTIFICATION_EVENT, duckVolumeTemporarily);
      window.removeEventListener(VOICE_NOTIFICATION_END_EVENT, handleVoiceNotificationCompleted);
      activeVoicePlaybackCountRef.current = 0;
      restoreVolume();
    };
  }, [duckVolumeTemporarily, handleVoiceNotificationCompleted, restoreVolume]);

  useEffect(() => {
    if (!autoPlay || isPlayingRef.current) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    void tryPlayAudio(audio, "[MiniAudioPlayer] Failed to auto-play audio");
  }, [autoPlay, tryPlayAudio]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: "Neo Brew Timer",
      album: "Coffee Timer BGM",
      artwork: [
        { src: track.artworkUrl, sizes: "96x96", type: "image/webp" },
        { src: track.artworkUrl, sizes: "128x128", type: "image/webp" },
        { src: track.artworkUrl, sizes: "256x256", type: "image/webp" },
        { src: track.artworkUrl, sizes: "512x512", type: "image/webp" },
      ],
    });
  }, [track.artworkUrl, track.title]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        void handlePlay();
      });
      navigator.mediaSession.setActionHandler("pause", handlePause);
      navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    } catch (error) {
      console.warn("[MiniAudioPlayer] Failed to set Media Session handlers", error);
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } catch {
        // noop
      }
    };
  }, [handleNext, handlePause, handlePlay]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    return () => {
      navigator.mediaSession.playbackState = "none";
      navigator.mediaSession.metadata = null;
    };
  }, []);

  const rootClassName = useMemo(
    () => [styles.player, className].filter(Boolean).join(" "),
    [className],
  );

  const handleTogglePlay = async () => {
    if (isPlaying) {
      handlePause();
      return;
    }

    await handlePlay();
  };

  return (
    <section className={rootClassName}>
      <img className={styles.artwork} src={track.artworkUrl} alt="" />
      <div className={styles.meta}>
        <div className={styles.title} title={track.title}>{track.title}</div>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause BGM" : "Play BGM"}
        >
          {isBuffering ? <span className={styles.spinner} aria-hidden="true" /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        {onNextTrack && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleNext}
            aria-label="Next track"
          >
            <SkipForwardIcon />
          </button>
        )}
      </div>
    </section>
  );
}

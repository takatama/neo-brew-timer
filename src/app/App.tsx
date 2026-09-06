import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, useLocation } from "react-router-dom";
import { Header } from "../shared/components/Header";
import { IntroPage } from "./routes/IntroPage";
import { SetupPage } from "./routes/SetupPage";
import { TimerPage } from "./routes/TimerPage";
import { useSessionStore } from "../features/timer/store";
import { useSettingsStore } from "../features/settings/store";
import { getActiveBgmDayOfWeek, getActiveBgmTracks } from "../features/timer/data/bgm";
import { getSavedBgmTrackIndex, setSavedBgmTrackIndex } from "../features/timer/data/bgm/playbackProgress";
import { FloatingMiniPlayer } from "../features/timer/components/FloatingMiniPlayer";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";
import { DisplayLanguageProvider } from "../shared/i18n/DisplayLanguage";
import {
  choosePreferredLanguage,
  resolveAppRoute,
  type AppPage,
} from "../shared/i18n/routing";
import styles from "./App.module.css";

function AppShell({ page }: { page: AppPage }) {
  const bgmEnabled = useSettingsStore((s) => s.bgmEnabled);
  const debugEnabled = useSettingsStore((s) => s.debugEnabled);
  const debugBgmDayOfWeek = useSettingsStore((s) => s.debugBgmDayOfWeek);
  const currentBgmDayOfWeek = useMemo(
    () => getActiveBgmDayOfWeek({ debugEnabled, debugDayOfWeek: debugBgmDayOfWeek }),
    [debugEnabled, debugBgmDayOfWeek],
  );
  const tracks = useMemo(
    () => getActiveBgmTracks({ debugEnabled, debugDayOfWeek: debugBgmDayOfWeek }),
    [debugEnabled, debugBgmDayOfWeek],
  );
  const [trackIndex, setTrackIndex] = useState(0);

  useEffect(() => {
    if (tracks.length === 0) {
      setTrackIndex(0);
      return;
    }

    const savedTrackIndex = getSavedBgmTrackIndex(currentBgmDayOfWeek);
    setTrackIndex(savedTrackIndex % tracks.length);
  }, [currentBgmDayOfWeek, tracks.length]);

  const currentTrack = tracks[trackIndex] ?? tracks[0];
  const isSetupPage = page === "setup";
  const isTimerPage = page === "timer";

  const shouldShowMiniPlayer =
    Boolean(currentTrack) &&
    bgmEnabled &&
    (isTimerPage || isSetupPage);

  const handleNextTrack = (trigger: "manual" | "ended") => {
    if (tracks.length <= 1) {
      return;
    }

    setTrackIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % tracks.length;
      if (trigger === "ended") {
        setSavedBgmTrackIndex(currentBgmDayOfWeek, nextIndex);
      }
      return nextIndex;
    });
  };

  const handleTrackPlaybackStarted = () => {
    if (tracks.length === 0) {
      return;
    }

    const nextIndex = (trackIndex + 1) % tracks.length;
    setSavedBgmTrackIndex(currentBgmDayOfWeek, nextIndex);
  };

  return (
    <div className={`${styles.app} ${shouldShowMiniPlayer ? styles.withMiniPlayer : ""}`}>
      <Header />
      <ErrorBoundary>
        {page === "intro" && <IntroPage />}
        {page === "setup" && <SetupPage />}
        {page === "timer" && <TimerPage />}
      </ErrorBoundary>
      {shouldShowMiniPlayer && currentTrack && (
        <FloatingMiniPlayer
          track={currentTrack}
          onNextTrack={handleNextTrack}
          onTrackPlaybackStarted={handleTrackPlaybackStarted}
        />
      )}
    </div>
  );
}

function RoutedApp() {
  const location = useLocation();
  const introSeen = useSessionStore((state) => state.introSeen);
  const savedLanguage = useSettingsStore((state) => state.language);
  const preferredLanguage = choosePreferredLanguage(
    savedLanguage,
    typeof navigator === "undefined" ? undefined : navigator.language,
  );
  const route = resolveAppRoute(
    location.pathname,
    location.search,
    location.hash,
    preferredLanguage,
    introSeen,
  );

  if (route.redirectTo) {
    return <Navigate to={route.redirectTo} replace />;
  }

  return (
    <DisplayLanguageProvider language={route.language}>
      <AppShell page={route.page} />
    </DisplayLanguageProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}

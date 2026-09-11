import { useEffect, useMemo, useState } from "react";
import { createBrowserRouter, RouterProvider, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Header } from "../shared/components/Header";
import { IntroPage } from "./routes/IntroPage";
import { SetupPage } from "./routes/SetupPage";
import { TimerPage } from "./routes/TimerPage";
import { useSettingsStore } from "../features/settings/store";
import { getActiveBgmDayOfWeek, getActiveBgmTracks } from "../features/timer/data/bgm";
import { getSavedBgmTrackIndex, setSavedBgmTrackIndex } from "../features/timer/data/bgm/playbackProgress";
import { FloatingMiniPlayer } from "../features/timer/components/FloatingMiniPlayer";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";
import { OfflineNotice } from "../shared/components/OfflineNotice";
import styles from "./App.module.css";

function RootRedirect() {
  return <Navigate to="/setup" replace />;
}

function AppShell() {
  const { pathname } = useLocation();
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
  const isSetupPage = pathname === "/setup";
  const isTimerPage = pathname === "/timer";

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
    <div className={`${styles.app} ${shouldShowMiniPlayer && !isTimerPage ? styles.withMiniPlayer : ""}`}>
      <Header />
      <OfflineNotice visible={isSetupPage} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      {shouldShowMiniPlayer && currentTrack && (
        <FloatingMiniPlayer
          inline={isTimerPage}
          track={currentTrack}
          onNextTrack={handleNextTrack}
          onTrackPlaybackStarted={handleTrackPlaybackStarted}
        />
      )}
    </div>
  );
}

const router = createBrowserRouter([{ path: "*", element: <AppShell /> }]);

export function App() { return <RouterProvider router={router} />; }

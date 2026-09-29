import { useLayoutEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Header } from "../shared/components/Header";
import { IntroPage } from "./routes/IntroPage";
import { SetupPage } from "./routes/SetupPage";
import { TimerPage } from "./routes/TimerPage";
import { useSettingsStore } from "../features/settings/store";
import { ErrorBoundary } from "../shared/components/ErrorBoundary";
import { OfflineNotice } from "../shared/components/OfflineNotice";
import { DisplayLanguageProvider } from "../shared/i18n/DisplayLanguage";
import {
  choosePreferredLanguage,
  resolveAppRoute,
} from "../shared/i18n/routing";
import styles from "./App.module.css";

function RoutedApp() {
  const location = useLocation();
  const savedLanguage = useSettingsStore((state) => state.language);
  const preferredLanguage = choosePreferredLanguage(
    savedLanguage,
    navigator.language,
  );
  const route = resolveAppRoute(
    location.pathname,
    location.search,
    location.hash,
    preferredLanguage,
  );
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [route.page]);
  if (route.redirectTo) return <Navigate to={route.redirectTo} replace />;
  return (
    <DisplayLanguageProvider language={route.language}>
      <div className={styles.app} data-page={route.page}>
        <Header brewing={route.page === "timer"} />
        <ErrorBoundary>
          {route.page === "intro" && <IntroPage />}
          {route.page === "setup" && <SetupPage />}
          {route.page === "timer" && <TimerPage />}
        </ErrorBoundary>
        <OfflineNotice visible={route.page === "setup"} />
      </div>
    </DisplayLanguageProvider>
  );
}
const router = createBrowserRouter([{ path: "*", element: <RoutedApp /> }]);
export function App() {
  return <RouterProvider router={router} />;
}

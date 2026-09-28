import { Component, type ReactNode } from "react";
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from "react-router-dom";
import i18n from "../i18n/config";
import { DisplayLanguageProvider } from "../i18n/DisplayLanguage";
import { choosePreferredLanguage, resolveRoute } from "../i18n/routing";
import { useSettings } from "../settings/store";
import { BrewPage } from "../pages/BrewPage";
import { PreparePage } from "../pages/PreparePage";

function RoutedApp() {
  const location = useLocation();
  const saved = useSettings((s) => s.language);
  const preferred = choosePreferredLanguage(saved, typeof navigator === "undefined" ? undefined : navigator.language);
  const route = resolveRoute(location.pathname, location.search, location.hash, preferred);

  if (route.redirectTo) return <Navigate to={route.redirectTo} replace />;

  return (
    <DisplayLanguageProvider language={route.language}>
      <ErrorBoundary>
        {route.page === "brew" ? <BrewPage /> : <PreparePage key="prepare" />}
      </ErrorBoundary>
    </DisplayLanguageProvider>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 32, textAlign: "center" }}>
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>{i18n.t("error.title")}</p>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            style={{
              marginTop: 20,
              minHeight: 52,
              padding: "0 24px",
              border: 0,
              borderRadius: 999,
              background: "var(--primary)",
              color: "var(--primary-ink)",
              fontWeight: 700,
            }}
          >
            {i18n.t("error.back")}
          </button>
        </div>
      </div>
    );
  }
}

const router = createBrowserRouter([{ path: "*", element: <RoutedApp /> }]);

export function App() {
  return <RouterProvider router={router} />;
}

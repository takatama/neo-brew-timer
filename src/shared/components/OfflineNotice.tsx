import { useRegisterSW } from "virtual:pwa-register/react";
import { useTranslation } from "react-i18next";
export function OfflineNotice({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  if (!visible || (!offlineReady && !needRefresh)) return null;
  return <aside className="offline-notice" role="status">
    <span>{t(needRefresh ? "pwa.update" : "pwa.ready")}</span>
    {needRefresh && <button className="choice" onClick={() => void updateServiceWorker(true)}>{t("pwa.apply")}</button>}
  </aside>;
}

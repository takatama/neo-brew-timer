import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";
import styles from "./OfflineNotice.module.css";

/**
 * Tells people once when the app works offline, and offers updates only here
 * on the preparation screen so a new version never reloads mid-brew.
 */
export function OfflineNotice() {
  const { t } = useTranslation();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!offlineReady || needRefresh) return;
    const timer = window.setTimeout(() => {
      setHidden(true);
      setOfflineReady(false);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [offlineReady, needRefresh, setOfflineReady]);

  if (needRefresh) {
    return (
      <aside className={styles.notice} role="status">
        <span>{t("pwa.update")}</span>
        <button type="button" className={styles.action} onClick={() => void updateServiceWorker(true)}>
          {t("pwa.apply")}
        </button>
      </aside>
    );
  }
  if (!offlineReady || hidden) return null;
  return (
    <aside className={styles.notice} role="status">
      <span className={styles.dot} aria-hidden="true" />
      <span>{t("pwa.ready")}</span>
    </aside>
  );
}

import { useEffect, useRef } from "react";

// Native modal dialogs contain keyboard focus and make the page behind them inert.
export function useDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, [open]);
  return ref;
}

import { useEffect, useId, useRef, type ReactNode, type PointerEvent } from "react";
import { CloseIcon } from "./icons";
import styles from "./Sheet.module.css";

/**
 * A bottom sheet built on the native modal <dialog>, which contains focus,
 * closes on Escape and makes the page behind it inert. Drag the handle down
 * (or tap outside) to dismiss.
 */
function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      previous?.focus();
    };
  }, [open]);
  return ref;
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  closeLabel: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, closeLabel, children }: SheetProps) {
  const ref = useModal(open);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);

  if (!open) return null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    drag.current = { y: event.clientY, dy: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !panelRef.current) return;
    drag.current.dy = Math.max(0, event.clientY - drag.current.y);
    panelRef.current.style.transform = `translateY(${drag.current.dy}px)`;
    panelRef.current.style.transition = "none";
  };
  const onPointerUp = () => {
    const panel = panelRef.current;
    const dy = drag.current?.dy ?? 0;
    drag.current = null;
    if (!panel) return;
    panel.style.transition = "";
    panel.style.transform = "";
    if (dy > 90) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className={styles.panel}>
        <div
          className={styles.head}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className={styles.grip} aria-hidden="true" />
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
            <CloseIcon size={20} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmProps) {
  const ref = useModal(open);
  const titleId = useId();
  const bodyId = useId();
  if (!open) return null;
  return (
    <dialog
      ref={ref}
      className={styles.confirm}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className={styles.confirmCard}>
        <h2 id={titleId} className={styles.confirmTitle}>{title}</h2>
        <p id={bodyId} className={styles.confirmBody}>{body}</p>
        <div className={styles.confirmActions}>
          <button type="button" className={styles.secondary} onClick={onCancel} autoFocus>
            {cancelLabel}
          </button>
          <button type="button" className={styles.danger} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

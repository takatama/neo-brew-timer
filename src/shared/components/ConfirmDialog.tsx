import { useId } from "react";
import { useDialog } from "./useDialog";
import styles from "./ConfirmDialog.module.css";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useDialog(open);
  const titleId = useId();
  const messageId = useId();

  if (!open) return null;

  return (
    <dialog aria-describedby={messageId} aria-labelledby={titleId} ref={dialogRef} className={styles.modal} onCancel={(event) => { event.preventDefault(); onCancel(); }} onClick={onCancel}>
      <div
        className={styles.card}
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id={titleId} className={styles.title}>{title}</h3>
        <p id={messageId} className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.outline}`} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

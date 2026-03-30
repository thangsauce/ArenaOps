import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "warning" | "success";
  confirmDisabled?: boolean;
  customContent?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  confirmVariant = "danger",
  confirmDisabled = false,
  customContent,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setTimeout(() => cancelRef.current?.focus(), 0);
    } else {
      (triggerRef.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "ArrowRight") {
        if (document.activeElement === cancelRef.current) {
          e.preventDefault();
          confirmRef.current?.focus();
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        if (document.activeElement === confirmRef.current) {
          e.preventDefault();
          cancelRef.current?.focus();
        }
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = document.getElementById("confirm-dialog-card");
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
            aria-hidden="true"
          />
          <motion.div
            id="confirm-dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative bg-arena-surface rounded-2xl border border-arena-border shadow-lg p-6 max-w-100 w-full mx-4"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <h2
              id="confirm-dialog-title"
              className="font-bold text-arena-text text-base mb-1"
            >
              {title}
            </h2>
            <p className="text-arena-text-muted text-sm mb-5">{description}</p>
            {customContent ? <div className="mb-5">{customContent}</div> : null}
            <div className="flex gap-3 justify-end">
              <button
                ref={cancelRef}
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded-xl border border-arena-border text-arena-text hover:bg-arena-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                ref={confirmRef}
                disabled={confirmDisabled}
                onClick={onConfirm}
                className={`px-4 py-2 text-sm rounded-xl transition-colors font-semibold ${
                  confirmVariant === "warning"
                    ? "bg-orange-500 hover:bg-orange-400 text-arena-bg"
                    : confirmVariant === "success"
                      ? "bg-arena-accent hover:bg-arena-accent-hover text-arena-bg"
                      : "bg-red-500 hover:bg-red-600 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';
import { useApp } from '../store/store';
import { ToastContext, type ToastVariant } from './toastContext';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const toastOnLeft = settings.appearance.mobileMenuPosition === 'right';

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, variant }]);
    timers.current[id] = setTimeout(() => dismiss(id), 3000);
  }, [dismiss]);

  useEffect(() => {
    const t = timers.current;
    return () => { Object.values(t).forEach(clearTimeout); };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className={`fixed top-4 z-70 flex flex-col gap-2 pointer-events-none ${
          toastOnLeft ? 'left-4 items-start' : 'right-4 items-end'
        }`}
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: toastOnLeft ? -64 : 64, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: toastOnLeft ? -64 : 64, scale: 0.92 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 bg-arena-surface border-arena-border border rounded-xl shadow-xl px-4 py-3 min-w-60 max-w-85 ${
                t.variant === 'success'
                  ? 'border-l-[3px] border-l-arena-accent'
                  : 'border-l-[3px] border-l-red-500'
              }`}
            >
              <span className={`mt-0.5 shrink-0 ${t.variant === 'success' ? 'text-arena-accent' : 'text-red-500'}`}>
                {t.variant === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              </span>
              <p className="text-sm text-arena-text flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-arena-text-muted hover:text-arena-text transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

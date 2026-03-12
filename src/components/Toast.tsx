import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, UserX, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { useApp } from '../store/store';
import type { Toast as ToastItem } from '../store/store';
import styles from './Toast.module.css';

const DURATION = 4500;

const toastIcon: Record<ToastItem['type'], React.ReactNode> = {
  match_change: <Zap size={16} color="var(--accent)" />,
  no_show: <UserX size={16} color="var(--red)" />,
  delay: <Clock size={16} color="#ffaa00" />,
  room_change: <MapPin size={16} color="var(--blue)" />,
  confirmation: <CheckCircle2 size={16} color="var(--accent)" />,
};

function ToastItem({ toast }: { toast: ToastItem }) {
  const { dismissToast } = useApp();
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => dismissToast(toast.id), 200);
  };

  useEffect(() => {
    const timer = setTimeout(dismiss, DURATION);
    return () => clearTimeout(timer);
  }, [toast.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`${styles.toast} ${leaving ? styles.leaving : ''}`} data-type={toast.type} role="status" aria-live="polite">
      <span className={styles.icon}>{toastIcon[toast.type]}</span>
      <div className={styles.body}>
        <p className={styles.title}>{toast.title}</p>
        <p className={styles.message}>{toast.message}</p>
      </div>
      <button className={styles.dismiss} onClick={dismiss} aria-label="Dismiss notification">
        <X size={14} />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.container} aria-label="Notifications">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>,
    document.body,
  );
}

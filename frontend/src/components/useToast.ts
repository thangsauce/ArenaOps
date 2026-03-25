import { useContext } from 'react';
import { ToastContext, type ToastVariant } from './toastContext';

export function useToast(): (message: string, variant?: ToastVariant) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx.toast;
}

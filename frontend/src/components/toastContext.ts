import { createContext } from 'react';

export type ToastVariant = 'success' | 'error';

export interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

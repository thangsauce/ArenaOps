import { useContext } from 'react';
import type { AppState } from './settings';
import { AppContext } from './context';

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within <AppProvider>');
  }
  return ctx;
}

import { createContext } from 'react';
import type { AppState } from './settings';

export const AppContext = createContext<AppState | null>(null);

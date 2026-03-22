import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { Match, Tournament } from '../types';
import { mockTournaments } from '../data/mockData';
import { DEFAULT_SETTINGS, type AppSettings, type TimePrefs, type Notification } from './settings';
import { AppContext } from './context';

const initialNotifications: Notification[] = [
  { id: 'n1', type: 'no_show',      title: 'No-show reported',      message: 'Jamie Nguyen did not appear for Match 4 in Spring Valorant Open.', timestamp: new Date(Date.now() - 1000 * 60 * 8),  read: false, tournamentId: 't1', matchId: 'm4' },
  { id: 'n2', type: 'delay',        title: 'Match delayed',          message: 'Match 3 (Sam Torres vs Taylor Park) delayed by 15 min.',          timestamp: new Date(Date.now() - 1000 * 60 * 22), read: false, tournamentId: 't1', matchId: 'm3' },
  { id: 'n3', type: 'confirmation', title: 'Availability confirmed', message: 'Alex Kim confirmed availability for Morning and Afternoon slots.', timestamp: new Date(Date.now() - 1000 * 60 * 45), read: true,  tournamentId: 't1' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [tournaments, setTournaments] = useState(mockTournaments);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [appSearchQuery, setAppSearchQuery] = useState('');

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Apply theme to <html> element whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (resolvedTheme: 'dark' | 'light') => {
      root.setAttribute('data-theme', resolvedTheme);
      root.classList.toggle('dark', resolvedTheme === 'dark');
      root.style.colorScheme = resolvedTheme;
    };

    if (settings.appearance.theme !== 'system') {
      applyTheme(settings.appearance.theme);
      return;
    }

    const applySystemTheme = () => applyTheme(mq.matches ? 'dark' : 'light');
    applySystemTheme();
    mq.addEventListener('change', applySystemTheme);
    return () => mq.removeEventListener('change', applySystemTheme);
  }, [settings.appearance.theme]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const setTimePrefs = useCallback((p: TimePrefs) => {
    updateSettings({ timePrefs: p });
  }, [updateSettings]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [{ ...n, id: `n${Date.now()}`, timestamp: new Date(), read: false }, ...prev]);
    if (settings.notifications.sound) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        [880, 1100].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.11);
          osc.connect(gain);
          osc.start(now + i * 0.11);
          osc.stop(now + i * 0.11 + 0.18);
        });
      } catch (_) {}
    }
  }, [settings.notifications.sound]);

  const markAllRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
  const markRead    = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);

  const updateMatch = useCallback((tournamentId: string, matchId: string, updates: Partial<Match>) => {
    setTournaments(prev => prev.map(t => t.id !== tournamentId ? t : {
      ...t, matches: t.matches.map(m => m.id !== matchId ? m : { ...m, ...updates }),
    }));
  }, []);

  const addTournament = useCallback((tournament: Tournament) => {
    setTournaments(prev => [...prev, tournament]);
  }, []);

  const updateTournamentStatus = useCallback((tournamentId: string, status: Tournament['status']) => {
    setTournaments(prev =>
      prev.map(t => (t.id === tournamentId ? { ...t, status } : t))
    );
  }, []);

  const startMatch = useCallback((tournamentId: string, matchId: string) => {
    updateMatch(tournamentId, matchId, { status: 'live' });
    const t = tournaments.find(x => x.id === tournamentId);
    const m = t?.matches.find(x => x.id === matchId);
    const p1 = t?.participants.find(p => p.id === m?.participant1Id)?.name ?? 'TBD';
    const p2 = t?.participants.find(p => p.id === m?.participant2Id)?.name ?? 'TBD';
    addNotification({ type: 'match_change', title: 'Match started', message: `${p1} vs ${p2} is now live in ${t?.name ?? ''}.`, tournamentId, matchId });
  }, [tournaments, updateMatch, addNotification]);

  const completeMatch = useCallback((tournamentId: string, matchId: string, winnerId: string | null, score1: number, score2: number) => {
    updateMatch(tournamentId, matchId, { status: 'completed', winnerId, score1, score2 });
    const t = tournaments.find(x => x.id === tournamentId);
    const winner = winnerId ? t?.participants.find(p => p.id === winnerId)?.name ?? 'Unknown' : null;
    addNotification({
      type: 'match_change',
      title: 'Match completed',
      message: winner
        ? `${winner} advances. Score: ${score1}–${score2}.`
        : `Match ended in a tie. Score: ${score1}–${score2}.`,
      tournamentId,
      matchId,
    });
  }, [tournaments, updateMatch, addNotification]);

  const reportNoShow = useCallback((tournamentId: string, matchId: string, participantId: string) => {
    updateMatch(tournamentId, matchId, { status: 'delayed' });
    const t = tournaments.find(x => x.id === tournamentId);
    const name = t?.participants.find(p => p.id === participantId)?.name ?? 'Participant';
    addNotification({ type: 'no_show', title: 'No-show reported', message: `${name} did not appear. Match rescheduled automatically.`, tournamentId, matchId });
  }, [tournaments, updateMatch, addNotification]);

  const reportDelay = useCallback((tournamentId: string, matchId: string, minutes: number) => {
    updateMatch(tournamentId, matchId, { status: 'delayed' });
    const t = tournaments.find(x => x.id === tournamentId);
    const m = t?.matches.find(x => x.id === matchId);
    const p1 = t?.participants.find(p => p.id === m?.participant1Id)?.name ?? 'TBD';
    const p2 = t?.participants.find(p => p.id === m?.participant2Id)?.name ?? 'TBD';
    addNotification({ type: 'delay', title: `Match delayed ${minutes} min`, message: `${p1} vs ${p2} pushed back. Downstream matches auto-adjusted.`, tournamentId, matchId });
  }, [tournaments, updateMatch, addNotification]);

  const bookRoom = useCallback((tournamentId: string, matchId: string, locationId: string) => {
    updateMatch(tournamentId, matchId, { locationId });
    const t = tournaments.find(x => x.id === tournamentId);
    const loc = t?.locations.find(l => l.id === locationId);
    addNotification({ type: 'room_change', title: 'Room assigned', message: `Match assigned to ${loc?.name ?? 'room'} in ${loc?.building ?? ''}.`, tournamentId, matchId });
  }, [tournaments, updateMatch, addNotification]);

  return (
    <AppContext.Provider value={{
      tournaments, notifications, unreadCount,
      appSearchQuery, setAppSearchQuery,
      settings, updateSettings,
      timePrefs: settings.timePrefs, setTimePrefs,
      addNotification, markAllRead, markRead,
      updateMatch, reportNoShow, reportDelay, startMatch, completeMatch, bookRoom,
      addTournament, updateTournamentStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

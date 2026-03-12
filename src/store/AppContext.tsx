import { useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Match, Tournament } from '../types';
import { mockTournaments } from '../data/mockData';
import { DEFAULT_SETTINGS, type AppSettings, type TimePrefs, type Notification, type Toast } from './settings';
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
  const [toasts, setToasts] = useState<Toast[]>([]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const setTimePrefs = useCallback((p: TimePrefs) => {
    updateSettings({ timePrefs: p });
  }, [updateSettings]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = `n${Date.now()}`;
    setNotifications(prev => [{ ...n, id, timestamp: new Date(), read: false }, ...prev]);
    setToasts(prev => [...prev, { id, type: n.type, title: n.title, message: n.message }]);
  }, []);

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

  const startMatch = useCallback((tournamentId: string, matchId: string) => {
    updateMatch(tournamentId, matchId, { status: 'live' });
    const t = tournaments.find(x => x.id === tournamentId);
    const m = t?.matches.find(x => x.id === matchId);
    const p1 = t?.participants.find(p => p.id === m?.participant1Id)?.name ?? 'TBD';
    const p2 = t?.participants.find(p => p.id === m?.participant2Id)?.name ?? 'TBD';
    addNotification({ type: 'match_change', title: 'Match started', message: `${p1} vs ${p2} is now live in ${t?.name ?? ''}.`, tournamentId, matchId });
  }, [tournaments, updateMatch, addNotification]);

  const completeMatch = useCallback((tournamentId: string, matchId: string, winnerId: string, score1: number, score2: number) => {
    updateMatch(tournamentId, matchId, { status: 'completed', winnerId, score1, score2 });
    const t = tournaments.find(x => x.id === tournamentId);
    const winner = t?.participants.find(p => p.id === winnerId)?.name ?? 'Unknown';
    addNotification({ type: 'match_change', title: 'Match completed', message: `${winner} advances. Score: ${score1}–${score2}.`, tournamentId, matchId });
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
      toasts, dismissToast,
      settings, updateSettings,
      timePrefs: settings.timePrefs, setTimePrefs,
      addNotification, markAllRead, markRead,
      updateMatch, reportNoShow, reportDelay, startMatch, completeMatch, bookRoom,
      addTournament,
    }}>
      {children}
    </AppContext.Provider>
  );
}

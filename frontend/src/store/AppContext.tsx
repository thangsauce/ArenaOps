import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { Match, Participant, Tournament } from '../types';
import { mockTournaments } from '../data/mockData';
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type TimePrefs,
  type Notification,
  type DelayedMatchTimer,
} from './settings';
import { AppContext } from './context';

const initialNotifications: Notification[] = [
  { id: 'n1', type: 'no_show',      title: 'No-show reported',      message: 'Jamie Nguyen did not appear for Match 4 in Spring Valorant Open.', timestamp: new Date(Date.now() - 1000 * 60 * 8),  read: false, tournamentId: 't1', matchId: 'm4' },
  { id: 'n2', type: 'delay',        title: 'Match delayed',          message: 'Match 3 (Sam Torres vs Taylor Park) delayed by 15 min.',          timestamp: new Date(Date.now() - 1000 * 60 * 22), read: false, tournamentId: 't1', matchId: 'm3' },
  { id: 'n3', type: 'confirmation', title: 'Availability confirmed', message: 'Alex Kim confirmed availability for Morning and Afternoon slots.', timestamp: new Date(Date.now() - 1000 * 60 * 45), read: true,  tournamentId: 't1' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [tournaments, setTournaments] = useState(mockTournaments);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [delayedMatchTimers, setDelayedMatchTimers] = useState<Record<string, DelayedMatchTimer>>({});
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

  const getRosterEntryCount = useCallback((tournament: Tournament) => {
    const teamNames = new Set(
      tournament.participants
        .map(participant => participant.team?.trim())
        .filter((teamName): teamName is string => Boolean(teamName))
    );

    return teamNames.size > 0 ? teamNames.size : tournament.participants.length;
  }, []);

  const updateTournament = useCallback((tournamentId: string, updates: Partial<Tournament>) => {
    setTournaments(prev =>
      prev.map(t => (t.id === tournamentId ? { ...t, ...updates } : t))
    );
  }, []);

  const updateTournamentStatus = useCallback((tournamentId: string, status: Tournament['status']) => {
    setTournaments(prev =>
      prev.map(t => {
        if (t.id !== tournamentId) return t;
        if (status !== 'active') return { ...t, status };

        const rosterEntryCount = getRosterEntryCount(t);
        const hasSelectedVenue = Boolean(t.venueLocationId);
        const hasTimeSlot = Boolean(t.selectedTimeBlockId);

        if (rosterEntryCount < 2 || !hasSelectedVenue || !hasTimeSlot) {
          return t;
        }

        return { ...t, status };
      })
    );
  }, [getRosterEntryCount]);

  const deleteTournament = useCallback((tournamentId: string) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
  }, []);

  const removeParticipant = useCallback((tournamentId: string, participantId: string) => {
    setTournaments(prev =>
      prev.map(t =>
        t.id !== tournamentId
          ? t
          : { ...t, participants: t.participants.filter(p => p.id !== participantId) }
      )
    );
  }, []);

  const removeParticipants = useCallback((tournamentId: string, participantIds: string[]) => {
    if (participantIds.length === 0) return;
    const removedIds = new Set(participantIds);
    setTournaments(prev =>
      prev.map(t => {
        if (t.id !== tournamentId) return t;
        return {
          ...t,
          participants: t.participants.filter(p => !removedIds.has(p.id)),
          matches: t.matches.map(match => {
            const participant1Removed = match.participant1Id ? removedIds.has(match.participant1Id) : false;
            const participant2Removed = match.participant2Id ? removedIds.has(match.participant2Id) : false;
            const winnerRemoved = match.winnerId ? removedIds.has(match.winnerId) : false;
            if (!participant1Removed && !participant2Removed && !winnerRemoved) return match;
            return {
              ...match,
              participant1Id: participant1Removed ? null : match.participant1Id,
              participant2Id: participant2Removed ? null : match.participant2Id,
              winnerId: null,
              score1: participant1Removed || participant2Removed ? 0 : match.score1,
              score2: participant1Removed || participant2Removed ? 0 : match.score2,
              status: participant1Removed || participant2Removed ? 'scheduled' : match.status,
            };
          }),
        };
      })
    );
  }, []);

  const addParticipants = useCallback((tournamentId: string, participantsToAdd: Participant[]) => {
    if (participantsToAdd.length === 0) return;
    setTournaments(prev =>
      prev.map(t =>
        t.id !== tournamentId
          ? t
          : { ...t, participants: [...t.participants, ...participantsToAdd] }
      )
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
    setTournaments(prev =>
      prev.map(t => {
        if (t.id !== tournamentId) return t;

        const currentMatch = t.matches.find(m => m.id === matchId);
        if (!currentMatch) return t;

        const supportsAdvancement =
          t.format === 'single-elimination' || t.format === 'double-elimination';

        const nextRound = currentMatch.round + 1;
        const nextMatchNumber = Math.ceil(currentMatch.matchNumber / 2);
        const winnerSlotKey =
          currentMatch.matchNumber % 2 === 1 ? 'participant1Id' : 'participant2Id';

        return {
          ...t,
          matches: t.matches.map(match => {
            if (match.id === matchId) {
              return {
                ...match,
                status: 'completed',
                winnerId,
                score1,
                score2,
              };
            }

            if (
              supportsAdvancement &&
              winnerId &&
              match.round === nextRound &&
              match.matchNumber === nextMatchNumber
            ) {
              return {
                ...match,
                [winnerSlotKey]: winnerId,
              };
            }

            return match;
          }),
        };
      })
    );
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

  const setDelayedMatchTimer = useCallback((matchId: string, timer: DelayedMatchTimer) => {
    setDelayedMatchTimers(prev => ({ ...prev, [matchId]: timer }));
  }, []);

  const clearDelayedMatchTimer = useCallback((matchId: string) => {
    setDelayedMatchTimers(prev => {
      if (!(matchId in prev)) return prev;
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
  }, []);

  const bookRoom = useCallback((tournamentId: string, matchId: string, locationId: string) => {
    updateMatch(tournamentId, matchId, { locationId });
    const t = tournaments.find(x => x.id === tournamentId);
    const loc = t?.locations.find(l => l.id === locationId);
    addNotification({ type: 'room_change', title: 'Room assigned', message: `Match assigned to ${loc?.name ?? 'room'} in ${loc?.building ?? ''}.`, tournamentId, matchId });
  }, [tournaments, updateMatch, addNotification]);

  return (
    <AppContext.Provider value={{
      tournaments, notifications, unreadCount,
      delayedMatchTimers,
      appSearchQuery, setAppSearchQuery,
      settings, updateSettings,
      timePrefs: settings.timePrefs, setTimePrefs,
      addNotification, markAllRead, markRead,
      updateMatch, reportNoShow, reportDelay, setDelayedMatchTimer,
      clearDelayedMatchTimer, startMatch, completeMatch, bookRoom,
      addTournament, updateTournament, updateTournamentStatus,
      deleteTournament, removeParticipant, removeParticipants, addParticipants,
    }}>
      {children}
    </AppContext.Provider>
  );
}

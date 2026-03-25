import {
  Bell,
  Calendar,
  LayoutGrid,
  MapPin,
  Settings,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Notification, TimePrefs } from '../store/settings';
import type { Tournament } from '../types';
import { formatTimeRange } from './time';

export type AppSearchResult = {
  label: string;
  sub: string;
  icon: LucideIcon;
  path: string;
};

const SETTINGS_SECTIONS = [
  'Profile',
  'Appearance',
  'Time & Timezone',
  'Notifications',
  'Schedule Preferences',
  'Participant Preferences',
  'Tournament Defaults',
  'Bracket Preferences',
];

export function buildAppSearchResults({
  query,
  tournaments,
  notifications,
  timePrefs,
}: {
  query: string;
  tournaments: Tournament[];
  notifications: Notification[];
  timePrefs: TimePrefs;
}): AppSearchResult[] {
  const q = query.trim().toLowerCase();

  if (q.length < 1) return [];

  return [
    ...(['dashboard', 'overview', 'stats', 'home'].some((k) => k.includes(q))
      ? [{ label: 'Dashboard', sub: 'Overview & stats', icon: LayoutGrid, path: '/dashboard' }]
      : []),
    ...(['tournaments', 'tournament', 'bracket', 'brackets'].some((k) => k.includes(q))
      ? [{ label: 'Tournaments', sub: 'All tournaments & brackets', icon: Trophy, path: '/tournaments' }]
      : []),
    ...(['participants', 'participant', 'players', 'player', 'teams', 'team'].some((k) => k.includes(q))
      ? [{ label: 'Participants', sub: 'Players & teams', icon: Users, path: '/participants' }]
      : []),
    ...(['schedule', 'calendar', 'time', 'matches'].some((k) => k.includes(q))
      ? [{ label: 'Schedule', sub: 'Match schedule & time blocks', icon: Calendar, path: '/schedule' }]
      : []),
    ...(['live', 'control', 'delay', 'stream'].some((k) => k.includes(q))
      ? [{ label: 'Live Control', sub: 'Run live matches', icon: Zap, path: '/live' }]
      : []),
    ...(['rooms', 'room', 'booking', 'venue', 'venues', 'location', 'locations'].some((k) => k.includes(q))
      ? [{ label: 'Room Booking', sub: 'Rooms & assignments', icon: MapPin, path: '/rooms' }]
      : []),
    ...(['notifications', 'notification', 'alerts', 'alert', 'inbox'].some((k) => k.includes(q))
      ? [{ label: 'Notifications', sub: 'Alerts & updates', icon: Bell, path: '/notifications' }]
      : []),
    ...(['settings', 'preferences', 'profile', 'appearance', 'timezone'].some((k) => k.includes(q))
      ? [{ label: 'Settings', sub: 'Preferences & defaults', icon: Settings, path: '/settings' }]
      : []),
    ...tournaments
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.game.toLowerCase().includes(q) ||
          t.format.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q),
      )
      .map((t) => ({
        label: t.name,
        sub: `${t.game} · ${t.status}`,
        icon: Trophy,
        path: `/tournaments/${t.id}`,
      })),
    ...tournaments.flatMap((t) =>
      t.participants
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.team ?? '').toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.status.toLowerCase().includes(q),
        )
        .map((p) => ({
          label: p.team ? `${p.name} · ${p.team}` : p.name,
          sub: p.email,
          icon: Users,
          path: '/participants',
        })),
    ),
    ...tournaments.flatMap((t) =>
      t.matches
        .filter((m) => {
          const p1 = t.participants.find((p) => p.id === m.participant1Id)?.team
            ?? t.participants.find((p) => p.id === m.participant1Id)?.name
            ?? '';
          const p2 = t.participants.find((p) => p.id === m.participant2Id)?.team
            ?? t.participants.find((p) => p.id === m.participant2Id)?.name
            ?? '';
          return (
            p1.toLowerCase().includes(q) ||
            p2.toLowerCase().includes(q) ||
            m.status.toLowerCase().includes(q)
          );
        })
        .map((m) => {
          const p1 = t.participants.find((p) => p.id === m.participant1Id)?.team
            ?? t.participants.find((p) => p.id === m.participant1Id)?.name
            ?? 'TBD';
          const p2 = t.participants.find((p) => p.id === m.participant2Id)?.team
            ?? t.participants.find((p) => p.id === m.participant2Id)?.name
            ?? 'TBD';
          return {
            label: `${p1} vs ${p2}`,
            sub: `Schedule · ${m.status}`,
            icon: Calendar,
            path: '/schedule',
          };
        }),
    ),
    ...tournaments.flatMap((t) =>
      t.matches
        .filter(
          (m) =>
            (m.status === 'live' || m.status === 'delayed') &&
            (['live', 'delay', 'control'].some((k) => k.includes(q)) ||
              (t.participants.find((p) => p.id === m.participant1Id)?.team
                ?? t.participants.find((p) => p.id === m.participant1Id)?.name
                ?? '').toLowerCase().includes(q) ||
              (t.participants.find((p) => p.id === m.participant2Id)?.team
                ?? t.participants.find((p) => p.id === m.participant2Id)?.name
                ?? '').toLowerCase().includes(q)),
        )
        .map((m) => {
          const p1 = t.participants.find((p) => p.id === m.participant1Id)?.team
            ?? t.participants.find((p) => p.id === m.participant1Id)?.name
            ?? 'TBD';
          const p2 = t.participants.find((p) => p.id === m.participant2Id)?.team
            ?? t.participants.find((p) => p.id === m.participant2Id)?.name
            ?? 'TBD';
          return {
            label: `${p1} vs ${p2}`,
            sub: `Live Control · ${m.status}`,
            icon: Zap,
            path: '/live',
          };
        }),
    ),
    ...tournaments.flatMap((t) =>
      t.locations
        .filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.building.toLowerCase().includes(q),
        )
        .map((l) => ({
          label: l.name,
          sub: `Room Booking · ${l.building}`,
          icon: MapPin,
          path: '/rooms',
        })),
    ),
    ...notifications
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q),
      )
      .map((n) => ({
        label: n.title,
        sub: n.message.slice(0, 50),
        icon: Bell,
        path: '/notifications',
      })),
    ...SETTINGS_SECTIONS
      .filter((s) => s.toLowerCase().includes(q))
      .map((s) => ({
        label: s,
        sub: 'Settings',
        icon: Settings,
        path: '/settings',
      })),
    ...tournaments.flatMap((t) =>
      t.timeBlocks
        .filter((tb) => tb.label.toLowerCase().includes(q))
        .map((tb) => ({
          label: tb.label,
          sub: `Schedule · ${formatTimeRange(tb.start, tb.end, tb.date, timePrefs.format, timePrefs.timezone)}`,
          icon: Calendar,
          path: '/schedule',
        })),
    ),
  ]
    .filter(
      (r, i, arr) =>
        arr.findIndex((x) => x.label === r.label && x.path === r.path) === i,
    )
    .slice(0, 8);
}

export type TimeFormat = '12h' | '24h';
export type Timezone =
  | 'America/New_York' | 'America/Chicago' | 'America/Denver'
  | 'America/Los_Angeles' | 'America/Phoenix' | 'Pacific/Honolulu'
  | 'America/Anchorage' | 'Europe/London' | 'Europe/Paris'
  | 'Asia/Tokyo' | 'Asia/Shanghai' | 'Australia/Sydney' | 'UTC';

export const TIMEZONES: { value: Timezone; label: string; abbr: string }[] = [
  { value: 'America/New_York',    label: 'Eastern Time',   abbr: 'ET'   },
  { value: 'America/Chicago',     label: 'Central Time',   abbr: 'CT'   },
  { value: 'America/Denver',      label: 'Mountain Time',  abbr: 'MT'   },
  { value: 'America/Phoenix',     label: 'Arizona Time',   abbr: 'AZ'   },
  { value: 'America/Los_Angeles', label: 'Pacific Time',   abbr: 'PT'   },
  { value: 'Pacific/Honolulu',    label: 'Hawaii Time',    abbr: 'HT'   },
  { value: 'America/Anchorage',   label: 'Alaska Time',    abbr: 'AK'   },
  { value: 'Europe/London',       label: 'London',         abbr: 'GMT'  },
  { value: 'Europe/Paris',        label: 'Central Europe', abbr: 'CET'  },
  { value: 'Asia/Tokyo',          label: 'Japan',          abbr: 'JST'  },
  { value: 'Asia/Shanghai',       label: 'China',          abbr: 'CST'  },
  { value: 'UTC',                  label: 'UTC',            abbr: 'UTC'  },
  { value: 'Australia/Sydney',    label: 'Sydney',         abbr: 'AEST' },
];

export type Theme = 'dark' | 'light' | 'system';
export type Density = 'comfortable' | 'compact';
export type DefaultFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';
export type DefaultMaxParticipants = '4' | '8' | '16' | '32' | '64';
export type WeekStart = 'sunday' | 'monday';
export type DefaultScheduleView = 'grid' | 'list';
export type DefaultBracketView = 'flow' | 'tree' | 'list';
export type ParticipantSort = 'seed' | 'name' | 'status';

export type TimePrefs = {
  // Define your time preferences structure here, e.g.:
  timezone: Timezone;
  format: '12h' | '24h';
};

export interface AppearancePrefs {
  theme: Theme;
  density: Density;
}

export interface NotifPrefs {
  matchStart: boolean;
  delays: boolean;
  noShows: boolean;
  roomChanges: boolean;
  sound: boolean;
}

export interface TournamentDefaults {
  format: DefaultFormat;
  maxParticipants: DefaultMaxParticipants;
  organizerName: string;
}

export interface SchedulePrefs {
  weekStart: WeekStart;
  defaultView: DefaultScheduleView;
}

export interface BracketPrefs {
  defaultView: DefaultBracketView;
}

export interface ParticipantPrefs {
  sortBy: ParticipantSort;
  hideDeclined: boolean;
}

export interface Profile {
  name: string;
  email: string;
  university: string;
}

export interface AppSettings {
  timePrefs: TimePrefs;
  appearance: AppearancePrefs;
  notifications: NotifPrefs;
  tournamentDefaults: TournamentDefaults;
  schedulePrefs: SchedulePrefs;
  bracketPrefs: BracketPrefs;
  participantPrefs: ParticipantPrefs;
  profile: Profile;
}

export const DEFAULT_SETTINGS: AppSettings = {
  timePrefs: {
    timezone: 'America/New_York',
    format: '12h',
  },
  appearance: { theme: 'dark', density: 'comfortable' },
  notifications: { matchStart: true, delays: true, noShows: true, roomChanges: true, sound: false },
  tournamentDefaults: { format: 'single-elimination', maxParticipants: '8', organizerName: 'Thang Le' },
  schedulePrefs: { weekStart: 'sunday', defaultView: 'grid' },
  bracketPrefs: { defaultView: 'flow' },
  participantPrefs: { sortBy: 'seed', hideDeclined: false },
  profile: { name: 'Thang Le', email: 'th432726@ucf.edu', university: 'University of Central Florida' },
};

// ── Notification & AppState (here to avoid circular deps with context.ts) ────
import type { Tournament, Match } from '../types';

export interface Notification {
  id: string;
  type: 'no_show' | 'delay' | 'confirmation' | 'match_change' | 'room_change';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  tournamentId?: string;
  matchId?: string;
}

export interface AppState {
  tournaments: Tournament[];
  notifications: Notification[];
  unreadCount: number;
  settings: AppSettings;
  appSearchQuery: string;
  setAppSearchQuery: (query: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  timePrefs: TimePrefs;
  setTimePrefs: (p: TimePrefs) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  updateMatch: (tournamentId: string, matchId: string, updates: Partial<Match>) => void;
  reportNoShow: (tournamentId: string, matchId: string, participantId: string) => void;
  reportDelay: (tournamentId: string, matchId: string, minutes: number) => void;
  startMatch: (tournamentId: string, matchId: string) => void;
  completeMatch: (tournamentId: string, matchId: string, winnerId: string | null, score1: number, score2: number) => void;
  bookRoom: (tournamentId: string, matchId: string, locationId: string) => void;
  addTournament: (tournament: Tournament) => void;
  updateTournamentStatus: (tournamentId: string, status: Tournament['status']) => void;
}

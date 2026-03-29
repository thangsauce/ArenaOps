export type TournamentFormat =
  | 'single-elimination'
  | 'double-elimination'
  | 'round-robin'
  | 'swiss'
  | 'free-for-all'
  | 'group-stage'
  | 'battle-royale'
  | 'ladder';
export type TournamentStatus = 'draft' | 'registration' | 'active' | 'completed';
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'delayed' | 'cancelled';
export type ParticipantStatus = 'confirmed' | 'pending' | 'declined';

export interface Participant {
  id: string;
  name: string;
  team?: string;
  email: string;
  status: ParticipantStatus;
  availability: string[]; // time block ids
  seed?: number;
}

export interface TimeBlock {
  id: string;
  label: string;
  start: string;
  end: string;
  date: string;
}

export interface Location {
  id: string;
  name: string;
  building: string;
  capacity: number;
  available: boolean;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  participant1Id: string | null;
  participant2Id: string | null;
  winnerId: string | null;
  score1?: number;
  score2?: number;
  status: MatchStatus;
  timeBlockId?: string;
  locationId?: string;
  scheduledAt?: string;
  delayStartedAt?: number;
  delayDurationSeconds?: number;
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  participants: Participant[];
  matches: Match[];
  timeBlocks: TimeBlock[];
  locations: Location[];
  createdAt: string;
  startDate: string;
  organizerName: string;
  maxParticipants: number;
  description: string;
  venueLocationId?: string;
  selectedTimeBlockId?: string;
}

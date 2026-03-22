import { useState, useRef, useEffect, type ComponentType, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CalendarDays, ChevronLeft, ChevronRight, Gamepad2, Dumbbell, Brain, Diamond, FileText, Rocket } from 'lucide-react';
import type { TournamentFormat } from '../types';
import { useApp } from '../store/store';
import styles from './CreateTournament.module.css';
import valorantLogo from "../assets/game-logos/valorant-icon.png";
import leagueOfLegendsLogo from "../assets/game-logos/league-of-legends-icon.png";
import cs2Logo from "../assets/game-logos/icons/cs2.ico";
import rocketLeagueLogo from "../assets/game-logos/rocket-league.svg";
import overwatch2Logo from "../assets/game-logos/overwatch-2.svg";
import apexLegendsLogo from "../assets/game-logos/apex-legends.svg";
import smashBrosLogo from "../assets/game-logos/smash-bros.svg";
import streetFighterLogo from "../assets/game-logos/street-fighter-6.png";
import fortniteLogo from "../assets/game-logos/fortnite-icon.svg";
import tekken8Logo from "../assets/game-logos/tekken-8.svg";

type PickerIconProps = {
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
};

type GameOption = {
  name: string;
  logoSrc?: string;
  logoClassName?: string;
  logoStyle?: CSSProperties;
  logoWrapStyle?: CSSProperties;
  badgeIcon?: ComponentType<PickerIconProps>;
};

function SoccerBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.2 14.8 9l-1 3.3h-3.6L9.2 9 12 7.2Z" fill="currentColor" /><path d="m9.2 9-2.8.4-1.2 2.9m9.6-3.3 2.8.4 1.2 2.9m-8.6-.1-2 2.3.7 2.9m6.2-5.2 2 2.3-.7 2.9M9.1 17.4 12 16l2.9 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BasketballBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 3.5c2.1 2.1 3.2 5.2 3.2 8.5S14.1 18.4 12 20.5M12 3.5C9.9 5.6 8.8 8.7 8.8 12s1.1 6.4 3.2 8.5M3.8 12h16.4M6.3 6.3c3.9 1.3 7.5 1.3 11.4 0m0 11.4c-3.9-1.3-7.5-1.3-11.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function TennisBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M7.3 5.6c2.6 2 4.1 4.1 4.1 6.4s-1.5 4.4-4.1 6.4m9.4-12.8c-2.6 2-4.1 4.1-4.1 6.4s1.5 4.4 4.1 6.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
function FootballBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M7 7.4c2.8-2 7.2-2 10 0 2 2.8 2 6.4 0 9.2-2.8 2-7.2 2-10 0-2-2.8-2-6.4 0-9.2Z" stroke="currentColor" strokeWidth="1.8" /><path d="m9.2 9.3 5.6 5.4m-5.6 0 5.6-5.4M10.1 12h3.8m-2.8-1.2v2.4m1.8-2.4v2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function BadmintonBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M8.2 6.2 13 11m-6-1.2 3.7 3.7m-5-.3 3.7 3.7m8-8L11.3 2.8m8.1 8.1-6.1-6.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M9.8 10.2 18 18.4c.8.8.8 2 0 2.8s-2 .8-2.8 0L7 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function VolleyballBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 3.5c2.8 2.2 4.2 4.5 4.2 6.9m-8.4 0C7.8 8 9.2 5.7 12 3.5m7.9 3.3c-3.6 1.1-5.9 3-6.9 5.7m-8.9-5.7c3.6 1.1 5.9 3 6.9 5.7m7 7c-1.7-2.9-4-4.6-7-5m-5 4.8c1.7-2.9 4-4.6 7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function BaseballBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M8.1 6.7c-1.5 1.9-2.3 4-2.3 5.3s.8 3.4 2.3 5.3m7.8-10.6c1.5 1.9 2.3 4 2.3 5.3s-.8 3.4-2.3 5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M8.8 8.6c.9.5 1.7 1.2 2.2 2.1m4-2.1c-.9.5-1.7 1.2-2.2 2.1m-4 4.7c.9.5 1.7 1.2 2.2 2.1m4-2.1c-.9.5-1.7 1.2-2.2 2.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>;
}
function BoxingBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M5 18c-2 0-3.5-1.5-3.5-3.5V12c0-1.5 1-2.5 2.5-2.5H5V7h4v3.2c1.7.5 3 1.9 3 3.7v.6c0 2-1.6 3.5-3.6 3.5H5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M19 18c2 0 3.5-1.5 3.5-3.5V12c0-1.5-1-2.5-2.5-2.5H19V7h-4v3.2c-1.7.5-3 1.9-3 3.7v.6c0 2 1.6 3.5 3.6 3.5H19Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}
function TableTennisBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><circle cx="9" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12.5 15.2 17 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="18" cy="8" r="2.2" fill="currentColor" /></svg>;
}
function GolfBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M7 20c3 .7 7 .7 10-.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M10 4v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M10 4c2.7.7 4.5 1.7 6 3-1.4 1.2-3.3 2.1-6 2.1" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="17" cy="18.5" r="1.8" fill="currentColor" /></svg>;
}
function CyclingBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><circle cx="7" cy="17" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="18" cy="17" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M7 17l5-6h3l3 6m-6-6 2.5 6M13 8h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChessBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M8 20.5h8m-7-13.5h6v3H9V7Zm1.2-3.5h3.6v2.2h-3.6V3.5Zm-.4 6.5v2.4l-1.5 2.8H16.7l-1.5-2.8v-2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CheckersBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><circle cx="9" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="15" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.8" opacity="0.9" /><path d="M7.2 10h3.6m2.4 4h3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
}
function MahjongBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><rect x="6.5" y="3.5" width="11" height="17" rx="1.8" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M9.2 13.3c.8-.8 2-.8 2.8 0 .8-.8 2-.8 2.8 0M9.5 16.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
}
function GoBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M6 5.5v13m4-13v13m4-13v13m4-13v13M5.5 6h13m-13 4h13m-13 4h13m-13 4h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" /><circle cx="9.5" cy="10.5" r="2.1" fill="currentColor" /><circle cx="15" cy="14.5" r="2.1" stroke="currentColor" strokeWidth="1.6" /></svg>;
}
function ScrabbleBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><rect x="10" y="8" width="10" height="12" rx="1.8" stroke="currentColor" strokeWidth="1.8" /><rect x="4" y="4" width="10" height="12" rx="1.8" stroke="currentColor" strokeWidth="1.8" /><path d="M7 8.5c1.2-.8 3.2-.4 3 1.2-.2 1.4-2.8 1.4-3 2.8.1 1.6 2 2 3.2 1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="12.8" cy="19" r="0.9" fill="currentColor" /></svg>;
}
function MonopolyBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M3.5 13L12 5l8.5 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 13v7h11v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><rect x="9.5" y="15.5" width="5" height="4.5" rx="0.6" stroke="currentColor" strokeWidth="1.4" /><path d="M15.5 10V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
function BackgammonBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><rect x="3" y="3.5" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" /><line x1="12" y1="3.5" x2="12" y2="20.5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 4.5L7.5 13 5 4.5Z M5 4.5L10 4.5 7.5 13Z" fill="currentColor" opacity="0.7" /><path d="M14 4.5L16.5 13 14 4.5Z M14 4.5L19 4.5 16.5 13Z" fill="currentColor" opacity="0.4" /><circle cx="7.4" cy="17.2" r="1.5" fill="currentColor" /><circle cx="16.6" cy="17.2" r="1.5" stroke="currentColor" strokeWidth="1.4" /></svg>;
}
function PokerBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M12 4.8 16 9c0 1.7-1.2 3.1-2.9 3.4v2.2h2.1v2.2h-6.4v-2.2h2.1v-2.2C9.2 12.1 8 10.7 8 9l4-4.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9.4 16.8h5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function UnoBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><rect x="6.3" y="4.3" width="11.4" height="15.4" rx="2.4" stroke="currentColor" strokeWidth="1.8" transform="rotate(-8 12 12)" /><path d="M9.3 12c1.3-2.3 4.1-3.2 6.7-2.2-1.3 2.4-4.2 3.3-6.7 2.2Z" fill="currentColor" /></svg>;
}
function BlackjackBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><rect x="5" y="5" width="9.5" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.8" /><rect x="10.5" y="7" width="8.5" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.5" opacity="0.7" /><path d="M8 10c.9-1.5 3.2-1.5 4.1 0-.9 1.5-3.2 1.5-4.1 0Z" fill="currentColor" /><path d="M13.4 9.6h2.8m-1.4-1.4V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function MagicBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><path d="M12 3c-3.4 1.8-5.5 4.8-5.5 8.2 0 3.1 2.4 5.8 5.5 5.8s5.5-2.7 5.5-5.8C17.5 7.8 15.4 4.8 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 5.8v9m-4-3h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function YuGiOhBadgeIcon({ className, style }: PickerIconProps) {
  return <svg viewBox="0 0 24 24" className={className} style={style} fill="none" aria-hidden="true"><rect x="5.5" y="4.5" width="13" height="15" rx="1.8" stroke="currentColor" strokeWidth="1.8" /><path d="M8 8.2c2-1.4 5.8-1.4 7.8.2 1.3 1 1.4 2.8.1 4-1.9 1.7-5.8 1.7-7.8.3-1.4-1-1.5-3-.1-4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

const GAME_CATALOG: { category: string; Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; games: GameOption[] }[] = [
  {
    category: 'E-Sports', Icon: Gamepad2,
    games: [
      { name: 'Valorant', logoSrc: valorantLogo, logoClassName: styles.gameLogoImage },
      { name: 'League of Legends', logoSrc: leagueOfLegendsLogo, logoClassName: styles.gameLogoImage },
      { name: 'Counter-Strike 2', logoSrc: cs2Logo, logoClassName: styles.gameLogoImage },
      { name: 'Rocket League', logoSrc: rocketLeagueLogo, logoClassName: styles.gameLogoImage },
      { name: 'Overwatch 2', logoSrc: overwatch2Logo, logoClassName: styles.gameLogoImage },
      {
        name: 'Apex Legends',
        logoSrc: apexLegendsLogo,
        logoClassName: styles.gameLogoImageWide,
        logoWrapStyle: {
          background: 'linear-gradient(135deg, rgba(255, 109, 61, 0.24), rgba(255, 70, 85, 0.34))',
          borderColor: 'rgba(255, 102, 67, 0.28)',
          boxShadow: '0 0 0 1px rgba(255, 112, 75, 0.12) inset',
        },
        logoStyle: {
          filter: 'brightness(0) saturate(100%) invert(100%)',
        },
      },
      {
        name: 'Smash Bros',
        logoSrc: smashBrosLogo,
        logoClassName: styles.gameLogoImageWide,
        logoWrapStyle: {
          background: 'linear-gradient(135deg, rgba(255, 98, 70, 0.24), rgba(255, 178, 71, 0.34))',
          borderColor: 'rgba(255, 128, 88, 0.28)',
          boxShadow: '0 0 0 1px rgba(255, 146, 87, 0.12) inset',
        },
        logoStyle: {
          filter: 'brightness(0) saturate(100%) invert(100%)',
        },
      },
      { name: 'Street Fighter 6', logoSrc: streetFighterLogo, logoClassName: styles.gameLogoImageWide },
      {
        name: 'Fortnite',
        logoSrc: fortniteLogo,
        logoClassName: styles.gameLogoImage,
        logoWrapStyle: {
          background: 'linear-gradient(135deg, rgba(0, 199, 255, 0.22), rgba(94, 120, 255, 0.32))',
          borderColor: 'rgba(82, 168, 255, 0.28)',
          boxShadow: '0 0 0 1px rgba(83, 174, 255, 0.12) inset',
        },
        logoStyle: {
          filter: 'brightness(0) saturate(100%) invert(100%)',
        },
      },
      {
        name: 'Tekken 8',
        logoSrc: tekken8Logo,
        logoClassName: styles.gameLogoImage,
        logoWrapStyle: {
          background: 'linear-gradient(135deg, rgba(255, 80, 94, 0.22), rgba(181, 54, 255, 0.3))',
          borderColor: 'rgba(229, 90, 154, 0.28)',
          boxShadow: '0 0 0 1px rgba(226, 82, 144, 0.12) inset',
        },
        logoStyle: {
          filter: 'brightness(0) saturate(100%) invert(100%)',
        },
      },
    ],
  },
  {
    category: 'Sports', Icon: Dumbbell,
    games: [
      { name: 'Soccer', badgeIcon: SoccerBadgeIcon },
      { name: 'Basketball', badgeIcon: BasketballBadgeIcon },
      { name: 'Tennis', badgeIcon: TennisBadgeIcon },
      { name: 'American Football', badgeIcon: FootballBadgeIcon },
      { name: 'Badminton', badgeIcon: BadmintonBadgeIcon },
      { name: 'Volleyball', badgeIcon: VolleyballBadgeIcon },
      { name: 'Baseball', badgeIcon: BaseballBadgeIcon },
      { name: 'Boxing', badgeIcon: BoxingBadgeIcon },
      { name: 'Table Tennis', badgeIcon: TableTennisBadgeIcon },
      { name: 'Golf', badgeIcon: GolfBadgeIcon },
      { name: 'Cycling', badgeIcon: CyclingBadgeIcon },
    ],
  },
  {
    category: 'Board', Icon: Brain,
    games: [
      { name: 'Chess', badgeIcon: ChessBadgeIcon },
      { name: 'Checkers', badgeIcon: CheckersBadgeIcon },
      { name: 'Mahjong', badgeIcon: MahjongBadgeIcon },
      { name: 'Go', badgeIcon: GoBadgeIcon },
      { name: 'Scrabble', badgeIcon: ScrabbleBadgeIcon },
      { name: 'Monopoly', badgeIcon: MonopolyBadgeIcon },
      { name: 'Backgammon', badgeIcon: BackgammonBadgeIcon },
    ],
  },
  {
    category: 'Card', Icon: Diamond,
    games: [
      { name: 'Poker', badgeIcon: PokerBadgeIcon },
      { name: 'Uno', badgeIcon: UnoBadgeIcon },
      { name: 'Blackjack', badgeIcon: BlackjackBadgeIcon },
      { name: 'Magic: The Gathering', badgeIcon: MagicBadgeIcon },
      { name: 'Yu-Gi-Oh', badgeIcon: YuGiOhBadgeIcon },
    ],
  },
];

const formats: { value: TournamentFormat; label: string; desc: string }[] = [
  { value: 'single-elimination', label: 'Single Elimination', desc: 'Lose once and you\'re out' },
  { value: 'double-elimination', label: 'Double Elimination', desc: 'Two losses to be eliminated' },
  { value: 'round-robin',        label: 'Round Robin',        desc: 'Everyone plays everyone' },
  { value: 'swiss',              label: 'Swiss',              desc: 'Paired by record each round' },
  { value: 'free-for-all',       label: 'Free for All',       desc: 'All players compete simultaneously, ranked by score' },
  { value: 'group-stage',        label: 'Group Stage',        desc: 'Groups first, then knockout bracket' },
  { value: 'battle-royale',      label: 'Battle Royale',      desc: 'Last one standing wins each match' },
  { value: 'ladder',             label: 'Ladder',             desc: 'Challenge players above you to climb the ranks' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value + 'T00:00:00') : new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = value ? new Date(value + 'T00:00:00') : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectDay = (day: number) => {
    const d = new Date(year, month, day);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setOpen(false);
  };

  const displayValue = selected
    ? selected.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div ref={ref} className={styles.datePicker}>
      <button
        type="button"
        className={styles.dateTrigger}
        onClick={() => { setOpen(o => !o); if (value) setViewDate(new Date(value + 'T00:00:00')); }}
      >
        <CalendarDays size={16} className={styles.dateIcon} />
        <span className={value ? styles.dateValue : styles.datePlaceholder}>
          {displayValue || 'Select a date'}
        </span>
        <ChevronRight size={14} className={`${styles.dateCaret} ${open ? styles.dateCaretOpen : ''}`} />
      </button>

      {open && (
        <div className={styles.calendarDropdown}>
          <div className={styles.calendarHeader}>
            <button type="button" className={styles.calendarNav} onClick={() => setViewDate(new Date(year, month - 1, 1))}>
              <ChevronLeft size={15} />
            </button>
            <span className={styles.calendarMonth}>{MONTHS[month]} {year}</span>
            <button type="button" className={styles.calendarNav} onClick={() => setViewDate(new Date(year, month + 1, 1))}>
              <ChevronRight size={15} />
            </button>
          </div>
          <div className={styles.calendarGrid}>
            {WEEKDAYS.map(d => <div key={d} className={styles.calendarWeekday}>{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const thisDate = new Date(year, month, day);
              const isSel = selected && thisDate.getTime() === selected.getTime();
              const isToday = thisDate.getTime() === today.getTime();
              const isPast = thisDate < today;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isPast}
                  className={[
                    styles.calendarDay,
                    isSel ? styles.daySelected : '',
                    isToday && !isSel ? styles.dayToday : '',
                    isPast ? styles.dayPast : '',
                  ].join(' ')}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateTournament() {
  const navigate = useNavigate();
  const { addTournament } = useApp();
  const [step, setStep] = useState(1);
  const [gameCategory, setGameCategory] = useState('');
  const [form, setForm] = useState({
    name: '',
    game: '',
    format: '' as TournamentFormat | '',
    maxParticipants: '8',
    startDate: '',
    description: '',
    organizerName: '',
  });

  type FormField = keyof typeof form;
  const set = (field: FormField, value: string) => setForm(f => ({ ...f, [field]: value }));

  const canNext1 = form.name && gameCategory && form.game && form.format;
  const canNext2 = form.maxParticipants && form.startDate && form.organizerName;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}>
        <ArrowLeft size={16} /> {step > 1 ? 'Back' : 'Cancel'}
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Create Tournament</h1>
        <div className={styles.steps}>
          {[1, 2, 3].map(s => (
            <div key={s} className={`${styles.step} ${s === step ? styles.stepActive : s < step ? styles.stepDone : ''}`}>
              {s < step ? <CheckCircle2 size={14} /> : s}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Tournament Basics</h2>

          <div className={styles.field}>
            <label>Tournament Name</label>
              <input
                className={styles.input}
                placeholder="e.g. Spring Valorant Open"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Game / Sport</label>
            <div className={styles.gameCategoryTabs}>
              {GAME_CATALOG.map(({ category, Icon }) => (
                <button
                  key={category}
                  type="button"
                  className={`${styles.gameCategoryTab} ${gameCategory === category ? styles.gameCategoryTabActive : ''}`}
                  onClick={() => { setGameCategory(category); set('game', ''); }}
                >
                  <Icon size={16} strokeWidth={2.1} className={styles.gameCategoryIcon} />
                  <span>{category}</span>
                </button>
              ))}
            </div>
            {gameCategory && (
              <>
                <p className={styles.gamePickHint}>Pick the game</p>
                <div className={styles.gameGrid}>
                  {GAME_CATALOG.find(c => c.category === gameCategory)?.games.map(game => (
                    <button
                      key={game.name}
                      type="button"
                      className={`${styles.gameChip} ${form.game === game.name ? styles.gameChipSelected : ''}`}
                      onClick={() => set('game', game.name)}
                    >
                      <span className={styles.gameChipLogo} style={game.logoWrapStyle}>
                        {game.logoSrc ? (
                          <img src={game.logoSrc} alt="" className={game.logoClassName ?? styles.gameLogoImage} style={game.logoStyle} />
                        ) : game.badgeIcon ? (
                          <game.badgeIcon className={styles.gameIcon} />
                        ) : null}
                      </span>
                      <span>{game.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className={styles.gameCustomRow}>
              <span className={styles.gameCustomDivider}>or enter a custom game</span>
              <input
                className={styles.input}
                placeholder={gameCategory ? 'e.g. Dota 2, Pickleball, Magic...' : 'Pick a category first'}
                value={GAME_CATALOG.flatMap(c => c.games.map(game => game.name)).includes(form.game) ? '' : form.game}
                onChange={e => set('game', e.target.value)}
                disabled={!gameCategory}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Format</label>
            <div className={styles.formatGrid}>
              {formats.map(f => (
                <button
                  key={f.value}
                  className={`${styles.formatCard} ${form.format === f.value ? styles.selected : ''}`}
                  onClick={() => set('format', f.value)}
                >
                  <span className={styles.formatLabel}>{f.label}</span>
                  <span className={styles.formatDesc}>{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button className={styles.nextBtn} disabled={!canNext1} onClick={() => setStep(2)}>
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Details & Schedule</h2>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Max Participants</label>
              <select className={styles.input} value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)}>
                {[4, 8, 16, 32, 64].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Start Date</label>
              <DatePicker value={form.startDate} onChange={v => set('startDate', v)} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Your Name (Organizer)</label>
            <input className={styles.input} placeholder="Full name" value={form.organizerName} onChange={e => set('organizerName', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Description <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              placeholder="Brief description of the tournament..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.btnRow}>
            <button className={styles.cancelBtn} onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button className={styles.nextBtn} disabled={!canNext2} onClick={() => setStep(3)}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Review & Launch</h2>

          <div className={styles.reviewCard}>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Name</span>
              <span className={styles.reviewValue}>{form.name}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Game</span>
              <span className={styles.reviewValue}>{form.game}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Format</span>
              <span className={styles.reviewValue} style={{ textTransform: 'capitalize' }}>{form.format?.replace(/-/g, ' ')}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Max Players</span>
              <span className={styles.reviewValue}>{form.maxParticipants}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Start Date</span>
              <span className={styles.reviewValue}>
                {form.startDate
                  ? new Date(form.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : '—'}
              </span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Organizer</span>
              <span className={styles.reviewValue}>{form.organizerName}</span>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button className={styles.cancelBtn} onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button className={styles.draftBtn} onClick={() => {
              addTournament({
                id: `t${Date.now()}`,
                name: form.name,
                game: form.game,
                format: form.format as TournamentFormat,
                maxParticipants: parseInt(form.maxParticipants),
                startDate: form.startDate,
                organizerName: form.organizerName,
                description: form.description,
                createdAt: new Date().toISOString(),
                status: 'draft',
                participants: [],
                matches: [],
                locations: [],
                timeBlocks: [],
              });
              navigate('/dashboard');
            }}>
              <FileText size={16} />
              <span>Save as Draft</span>
            </button>
            <button className={styles.launchBtn} onClick={() => {
              addTournament({
                id: `t${Date.now()}`,
                name: form.name,
                game: form.game,
                format: form.format as TournamentFormat,
                maxParticipants: parseInt(form.maxParticipants),
                startDate: form.startDate,
                organizerName: form.organizerName,
                description: form.description,
                createdAt: new Date().toISOString(),
                status: 'active' as const,
                participants: [],
                matches: [],
                locations: [],
                timeBlocks: [],
              });
              navigate('/dashboard');
            }}>
              <Rocket size={16} />
              <span>Launch Tournament</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

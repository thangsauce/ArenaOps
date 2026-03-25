import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, User, ChevronRight, LayoutGrid, Gamepad2, Dumbbell, Brain, Diamond } from 'lucide-react';
import { useApp } from '../store/store';
import { formatDate } from '../utils/time';
import styles from './Tournaments.module.css';

const GAME_CATEGORIES: Record<string, string[]> = {
  'E-Sports': ['valorant', 'league of legends', 'cs2', 'rocket league', 'overwatch 2', 'apex legends', 'smash bros', 'street fighter 6', 'fortnite', 'tekken 8'],
  'Sports': ['soccer', 'american football', 'basketball', 'tennis', 'volleyball', 'badminton', 'table tennis', 'baseball'],
  'Board': ['chess', 'checkers', 'go', 'mahjong', 'scrabble', 'monopoly', 'backgammon'],
  'Card': ['poker', 'uno', 'blackjack', 'magic: the gathering', 'yu-gi-oh', 'hearthstone'],
};

const CATEGORY_TABS = [
  { label: 'All',          Icon: LayoutGrid },
  { label: 'E-Sports',     Icon: Gamepad2 },
  { label: 'Sports',       Icon: Dumbbell },
  { label: 'Board',        Icon: Brain },
  { label: 'Card',         Icon: Diamond },
];

const STATUS_SPOTS = [
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'registration', label: 'Register' },
  { key: 'completed', label: 'Completed' },
] as const;

const INDIVIDUAL_GAMES = new Set([
  'chess',
  'checkers',
  'go',
  'mahjong',
  'poker',
  'uno',
  'tennis',
  'table tennis',
  'smash bros',
  'street fighter 6',
  'fortnite',
  'tekken 8',
]);

export default function Tournaments() {
  const navigate = useNavigate();
  const { tournaments } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'draft' | 'registration' | 'completed'
  >('all');
  const categoryTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const categoryFiltered = categoryFilter === 'All'
    ? tournaments
    : tournaments.filter(t =>
        (GAME_CATEGORIES[categoryFilter] ?? []).includes(t.game.toLowerCase())
      );
  const filtered = statusFilter === 'all'
    ? categoryFiltered
    : categoryFiltered.filter((tournament) => tournament.status === statusFilter);
  const statusCounts = STATUS_SPOTS.map((spot) => ({
    ...spot,
    count: categoryFiltered.filter((tournament) => tournament.status === spot.key).length,
  }));

  const handleCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const nextIndex =
      e.key === 'ArrowRight'
        ? (index + 1) % CATEGORY_TABS.length
        : (index - 1 + CATEGORY_TABS.length) % CATEGORY_TABS.length;
    const nextTab = CATEGORY_TABS[nextIndex];
    setCategoryFilter(nextTab.label);
    categoryTabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tournaments</h1>
        <button className={styles.createBtn} onClick={() => navigate('/create')}>
          <Plus size={15} /> New
        </button>
      </div>

      <div className={styles.filters} role="tablist" aria-label="Tournament categories">
        {CATEGORY_TABS.map(({ label, Icon }, index) => (
          <button
            ref={(node) => {
              categoryTabRefs.current[index] = node;
            }}
            key={label}
            onClick={() => setCategoryFilter(label)}
            onKeyDown={(e) => handleCategoryKeyDown(e, index)}
            className={styles.filterChip}
            data-active={categoryFilter === label}
            role="tab"
            aria-selected={categoryFilter === label}
            tabIndex={categoryFilter === label ? 0 : -1}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className={styles.statusSpots}>
        {statusCounts.map((spot) => (
          <button
            key={spot.key}
            type="button"
            className={styles.statusSpot}
            data-status={spot.key}
            data-active={statusFilter === spot.key}
            data-available={spot.count > 0}
            onClick={() =>
              setStatusFilter((current) => (current === spot.key ? 'all' : spot.key))
            }
          >
            <span className={styles.statusSpotLabel}>{spot.label}</span>
            <span className={styles.statusSpotCount}>{spot.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map(t => {
          const confirmed = t.participants.filter(p => p.status === 'confirmed').length;
          const isIndividualGame = INDIVIDUAL_GAMES.has(t.game.toLowerCase());
          const StatIcon = isIndividualGame ? User : Users;
          const participantLabel = isIndividualGame ? 'players' : 'teams';
          const hasSetup = Boolean(t.selectedTimeBlockId) && Boolean(t.venueLocationId);
          return (
            <div key={t.id} className={styles.row} onClick={() => navigate(`/tournaments/${t.id}`)}>
              <div className={styles.rowIcon}>
                <Trophy size={16} />
              </div>
              <div className={styles.rowInfo}>
                <p className={styles.rowName}>{t.name}</p>
                <p className={styles.rowMeta}>{t.game} · {t.format.replace(/-/g, ' ')} · {formatDate(t.startDate)}</p>
              </div>
              <div className={styles.rowStats}>
                <div className={styles.stat}>
                  <StatIcon size={13} />
                  <span>{confirmed}/{t.maxParticipants} {participantLabel}</span>
                </div>
                {!hasSetup && (
                  <span className={styles.setupChip} data-ready={false}>
                    Room / Slot Missing
                  </span>
                )}
                <span className={styles.statusChip} data-status={t.status}>{t.status}</span>
              </div>
              <ChevronRight size={14} className={styles.arrow} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

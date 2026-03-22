import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, ChevronRight } from 'lucide-react';
import { useApp } from '../store/store';
import styles from './Tournaments.module.css';

const GAME_CATEGORIES: Record<string, string[]> = {
  'E-Sports':     ['valorant', 'league of legends', 'cs2', 'rocket league', 'overwatch 2', 'apex legends', 'smash bros', 'street fighter 6', 'fortnite', 'tekken 8'],
  'Sports':       ['soccer', 'american football', 'basketball', 'tennis', 'volleyball', 'badminton', 'table tennis', 'baseball'],
  'Board & Card': ['chess', 'checkers', 'poker', 'magic: the gathering', 'hearthstone', 'go'],
};

const CATEGORY_TABS = [
  { label: 'All',          icon: '🎮' },
  { label: 'E-Sports',     icon: '⚡' },
  { label: 'Sports',       icon: '🏆' },
  { label: 'Board & Card', icon: '♟️' },
];

export default function Tournaments() {
  const navigate = useNavigate();
  const { tournaments } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = categoryFilter === 'All'
    ? tournaments
    : tournaments.filter(t =>
        (GAME_CATEGORIES[categoryFilter] ?? []).includes(t.game.toLowerCase())
      );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tournaments</h1>
        <button className={styles.createBtn} onClick={() => navigate('/create')}>
          <Plus size={15} /> New
        </button>
      </div>

      <div className={styles.filters}>
        {CATEGORY_TABS.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => setCategoryFilter(label)}
            className={styles.filterChip}
            data-active={categoryFilter === label}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map(t => {
          const confirmed = t.participants.filter(p => p.status === 'confirmed').length;
          return (
            <div key={t.id} className={styles.row} onClick={() => navigate(`/tournaments/${t.id}`)}>
              <div className={styles.rowIcon}>
                <Trophy size={16} />
              </div>
              <div className={styles.rowInfo}>
                <p className={styles.rowName}>{t.name}</p>
                <p className={styles.rowMeta}>{t.game} · {t.format.replace(/-/g, ' ')} · {t.startDate}</p>
              </div>
              <div className={styles.rowStats}>
                <div className={styles.stat}><Users size={13} />{confirmed}/{t.maxParticipants}</div>
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

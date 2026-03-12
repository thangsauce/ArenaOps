import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Zap, Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useApp } from '../store/store';
import { TOURNAMENT_STATUS_LABELS } from '../types';
import type { Tournament } from '../types';
import styles from './Dashboard.module.css';

function TournamentCard({ t }: { t: Tournament }) {
  const navigate = useNavigate();
  const confirmed = t.participants.filter(p => p.status === 'confirmed').length;
  const liveMatches = t.matches.filter(m => m.status === 'live').length;
  const completedMatches = t.matches.filter(m => m.status === 'completed').length;
  const progress = t.matches.length > 0 ? Math.round((completedMatches / t.matches.length) * 100) : 0;

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/tournaments/${t.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/tournaments/${t.id}`)}
      aria-label={`View ${t.name}`}
    >
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>{t.name}</h3>
          <p className={styles.cardGame}>{t.game} · {t.format.replace(/-/g, ' ')}</p>
        </div>
        <span className={styles.status} data-status={t.status}>
          {liveMatches > 0 && <span className={styles.liveBlip} aria-hidden="true" />}
          {TOURNAMENT_STATUS_LABELS[t.status]}
        </span>
      </div>

      <div className={styles.cardStats}>
        <div className={styles.stat}>
          <Users size={14} aria-hidden="true" />
          <span>{confirmed}/{t.maxParticipants} confirmed</span>
        </div>
        <div className={styles.stat}>
          <Trophy size={14} aria-hidden="true" />
          <span>{completedMatches} matches done</span>
        </div>
        {liveMatches > 0 && (
          <div className={`${styles.stat} ${styles.statLive}`}>
            <Zap size={14} aria-hidden="true" />
            <span>{liveMatches} live</span>
          </div>
        )}
      </div>

      {t.matches.length > 0 && (
        <div className={styles.progressBar} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Match completion">
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className={styles.cardFooter}>
        <span className={styles.date}>
          <Clock size={12} aria-hidden="true" />
          {t.startDate}
        </span>
        <ChevronRight size={14} className={styles.arrow} aria-hidden="true" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tournaments } = useApp();

  const { active, upcoming, totalParticipants, liveNow } = useMemo(() => ({
    active: tournaments.filter(t => t.status === 'active'),
    upcoming: tournaments.filter(t => t.status === 'registration'),
    totalParticipants: tournaments.reduce((acc, t) => acc + t.participants.filter(p => p.status === 'confirmed').length, 0),
    liveNow: tournaments.reduce((acc, t) => acc + t.matches.filter(m => m.status === 'live').length, 0),
  }), [tournaments]);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroAccent}>Arena</span>OPS
          </h1>
          <p className={styles.heroSub}>Tournament management for university clubs</p>
        </div>
        <button className={styles.heroBtn} onClick={() => navigate('/create')}>
          Create Tournament <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Tournaments</p>
          <p className={styles.statValue}>{tournaments.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Active Now</p>
          <p className={`${styles.statValue} ${styles.statValueAccent}`}>{active.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Participants</p>
          <p className={styles.statValue}>{totalParticipants}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Matches Live</p>
          <p className={`${styles.statValue} ${styles.statValueRed}`}>{liveNow}</p>
        </div>
      </div>

      {active.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Tournaments</h2>
          <div className={styles.grid}>
            {active.map(t => <TournamentCard key={t.id} t={t} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Open Registration</h2>
          <div className={styles.grid}>
            {upcoming.map(t => <TournamentCard key={t.id} t={t} />)}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>All Tournaments</h2>
        <div className={styles.grid}>
          {tournaments.map(t => <TournamentCard key={t.id} t={t} />)}
        </div>
      </section>
    </div>
  );
}

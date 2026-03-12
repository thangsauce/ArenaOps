import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Zap, Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useApp } from '../store/store';
import type { Tournament } from '../types';
import styles from './Dashboard.module.css';

const statusColors: Record<string, string> = {
  active: 'var(--accent)',
  registration: 'var(--blue)',
  draft: 'var(--text-3)',
  completed: 'var(--text-3)',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  registration: 'Registration',
  draft: 'Draft',
  completed: 'Completed',
};

function TournamentCard({ t }: { t: Tournament }) {
  const navigate = useNavigate();
  const confirmed = t.participants.filter(p => p.status === 'confirmed').length;
  const liveMatches = t.matches.filter(m => m.status === 'live').length;
  const completedMatches = t.matches.filter(m => m.status === 'completed').length;
  const progress = t.matches.length > 0 ? Math.round((completedMatches / t.matches.length) * 100) : 0;

  return (
    <div className={styles.card} onClick={() => navigate(`/tournaments/${t.id}`)}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>{t.name}</h3>
          <p className={styles.cardGame}>{t.game} · {t.format.replace(/-/g, ' ')}</p>
        </div>
        <span className={styles.status} style={{ color: statusColors[t.status], background: `${statusColors[t.status]}18` }}>
          {liveMatches > 0 && <span className={styles.liveBlip} />}
          {statusLabels[t.status]}
        </span>
      </div>

      <div className={styles.cardStats}>
        <div className={styles.stat}>
          <Users size={14} />
          <span>{confirmed}/{t.maxParticipants}</span>
        </div>
        <div className={styles.stat}>
          <Trophy size={14} />
          <span>{completedMatches} matches</span>
        </div>
        {liveMatches > 0 && (
          <div className={styles.stat} style={{ color: 'var(--red)' }}>
            <Zap size={14} />
            <span>{liveMatches} live</span>
          </div>
        )}
      </div>

      {t.matches.length > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className={styles.cardFooter}>
        <span className={styles.date}>
          <Clock size={12} />
          {t.startDate}
        </span>
        <ChevronRight size={14} className={styles.arrow} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tournaments } = useApp();
  const active = tournaments.filter(t => t.status === 'active');
  const upcoming = tournaments.filter(t => t.status === 'registration');
  const all = tournaments;

  const totalParticipants = all.reduce((acc, t) => acc + t.participants.filter(p => p.status === 'confirmed').length, 0);
  const liveNow = all.reduce((acc, t) => acc + t.matches.filter(m => m.status === 'live').length, 0);

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
          Create Tournament <ArrowUpRight size={16} />
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Tournaments</p>
          <p className={styles.statValue}>{all.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Active Now</p>
          <p className={styles.statValue} style={{ color: 'var(--accent)' }}>{active.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Participants</p>
          <p className={styles.statValue}>{totalParticipants}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Matches Live</p>
          <p className={styles.statValue} style={{ color: 'var(--red)' }}>{liveNow}</p>
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
          {all.map(t => <TournamentCard key={t.id} t={t} />)}
        </div>
      </section>
    </div>
  );
}

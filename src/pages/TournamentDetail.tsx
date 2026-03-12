import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Clock, Zap, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { mockTournaments } from '../data/mockData';
import type { Match, Participant } from '../types';
import styles from './TournamentDetail.module.css';

const matchStatusStyles: Record<string, { color: string; label: string }> = {
  completed: { color: 'var(--text-3)', label: 'Done' },
  live: { color: 'var(--red)', label: 'Live' },
  scheduled: { color: 'var(--blue)', label: 'Scheduled' },
  delayed: { color: '#ffaa00', label: 'Delayed' },
  cancelled: { color: 'var(--text-3)', label: 'Cancelled' },
};

function MatchCard({ match, participants }: { match: Match; participants: Participant[] }) {
  const p1 = participants.find(p => p.id === match.participant1Id);
  const p2 = participants.find(p => p.id === match.participant2Id);
  const st = matchStatusStyles[match.status];
  const isLive = match.status === 'live';

  return (
    <div className={`${styles.matchCard} ${isLive ? styles.matchLive : ''}`}>
      <div className={styles.matchHeader}>
        <span className={styles.matchNum}>M{match.matchNumber}</span>
        <span className={styles.matchStatus} style={{ color: st.color }}>
          {isLive && <span className={styles.liveDot} />}
          {st.label}
        </span>
      </div>
      <div className={styles.matchups}>
        <div className={`${styles.matchup} ${match.winnerId === p1?.id ? styles.winner : ''}`}>
          <span className={styles.participantName}>{p1?.name ?? 'TBD'}</span>
          {match.status !== 'scheduled' && match.status !== 'cancelled' && (
            <span className={styles.score}>{match.score1 ?? 0}</span>
          )}
        </div>
        <div className={styles.vs}>VS</div>
        <div className={`${styles.matchup} ${match.winnerId === p2?.id ? styles.winner : ''}`}>
          <span className={styles.participantName}>{p2?.name ?? 'TBD'}</span>
          {match.status !== 'scheduled' && match.status !== 'cancelled' && (
            <span className={styles.score}>{match.score2 ?? 0}</span>
          )}
        </div>
      </div>
    </div>
  );
}

const participantStatusIcon = (status: Participant['status']) => {
  if (status === 'confirmed') return <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />;
  if (status === 'declined') return <XCircle size={14} style={{ color: 'var(--red)' }} />;
  return <Circle size={14} style={{ color: 'var(--text-3)' }} />;
};

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tournament = mockTournaments.find(t => t.id === id);

  if (!tournament) {
    return (
      <div className={styles.notFound}>
        <p>Tournament not found.</p>
        <button onClick={() => navigate('/')}>Go back</button>
      </div>
    );
  }

  const rounds = [...new Set(tournament.matches.map(m => m.round))].sort((a, b) => a - b);
  const confirmedCount = tournament.participants.filter(p => p.status === 'confirmed').length;
  const liveMatches = tournament.matches.filter(m => m.status === 'live');

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{tournament.name}</h1>
          <p className={styles.sub}>{tournament.game} · {tournament.format.replace(/-/g, ' ')} · by {tournament.organizerName}</p>
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.metaItem}><Users size={14} />{confirmedCount}/{tournament.maxParticipants} players</div>
          <div className={styles.metaItem}><Clock size={14} />{tournament.startDate}</div>
          {liveMatches.length > 0 && (
            <div className={styles.metaItem} style={{ color: 'var(--red)' }}>
              <Zap size={14} />{liveMatches.length} match{liveMatches.length > 1 ? 'es' : ''} live
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Bracket */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bracket</h2>
          {tournament.matches.length === 0 ? (
            <div className={styles.empty}>No matches yet — bracket will appear once the tournament starts.</div>
          ) : (
            <div className={styles.bracket}>
              {rounds.map(round => (
                <div key={round} className={styles.round}>
                  <p className={styles.roundLabel}>Round {round}</p>
                  <div className={styles.roundMatches}>
                    {tournament.matches
                      .filter(m => m.round === round)
                      .map(m => (
                        <MatchCard key={m.id} match={m} participants={tournament.participants} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Participants */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Participants</h2>
          <div className={styles.participantList}>
            {tournament.participants.map(p => (
              <div key={p.id} className={styles.participantRow}>
                {p.seed && <span className={styles.seed}>#{p.seed}</span>}
                {participantStatusIcon(p.status)}
                <div className={styles.participantInfo}>
                  <span className={styles.participantName2}>{p.name}</span>
                  <span className={styles.participantEmail}>{p.email}</span>
                </div>
                <span className={styles.availBadge}>
                  {p.availability.length} slot{p.availability.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Locations */}
        {tournament.locations.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Locations</h2>
            <div className={styles.locationGrid}>
              {tournament.locations.map(l => (
                <div key={l.id} className={`${styles.locationCard} ${!l.available ? styles.unavailable : ''}`}>
                  <MapPin size={14} />
                  <div>
                    <p className={styles.locName}>{l.name}</p>
                    <p className={styles.locBuilding}>{l.building} · Cap. {l.capacity}</p>
                  </div>
                  <span className={styles.locStatus} style={{ color: l.available ? 'var(--accent)' : 'var(--red)' }}>
                    {l.available ? 'Available' : 'Taken'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

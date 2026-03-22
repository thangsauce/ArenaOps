import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, MapPin, Clock, Zap,
  CheckCircle2, Circle, XCircle,
  LayoutGrid, List, GitBranch,
  Upload, Share2,
} from 'lucide-react';
import { useApp } from '../store/store';
import type { Match, Participant } from '../types';
import styles from './TournamentDetail.module.css';
import ShareModal from '../components/ShareModal';

// ── Constants ─────────────────────────────────────────────────────────────────
const SLOT_UNIT = 140; // height (px) of one R1 bracket slot
const COL_GAP   = 44;  // horizontal gap between tree columns
const CONN_MID  = 22;  // COL_GAP / 2 — where the vertical connector sits

type BracketView = 'flow' | 'tree' | 'list';

const matchStatusStyles: Record<string, { color: string; label: string }> = {
  completed: { color: 'var(--text-3)', label: 'Done'      },
  live:      { color: 'var(--red)',    label: 'Live'      },
  scheduled: { color: 'var(--blue)',   label: 'Scheduled' },
  delayed:   { color: '#ffaa00',       label: 'Delayed'   },
  cancelled: { color: 'var(--text-3)', label: 'Cancelled' },
};

function getRoundLabel(round: number, maxRound: number): string {
  if (round === maxRound)     return 'Grand Final';
  if (round === maxRound - 1) return 'Semifinals';
  if (round === maxRound - 2) return 'Quarterfinals';
  return `Round ${round}`;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ p, logo, size = 28 }: { p: Participant | undefined; logo?: string; size?: number }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={p?.name ?? ''}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  const name = p?.name ?? '?';
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = Math.abs([...name].reduce((acc, c) => acc + c.charCodeAt(0) * 3, 0)) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue}, 35%, 22%)`,
      border: `1px solid hsl(${hue}, 35%, 34%)`,
      color: `hsl(${hue}, 60%, 65%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.36), fontWeight: 700,
    }}>
      {p ? initials : '?'}
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, participants, logos, compact = false }: {
  match: Match; participants: Participant[]; logos: Record<string, string>; compact?: boolean;
}) {
  const p1 = participants.find(p => p.id === match.participant1Id);
  const p2 = participants.find(p => p.id === match.participant2Id);
  const st = matchStatusStyles[match.status];
  const isLive = match.status === 'live';
  const showScore = match.status !== 'scheduled' && match.status !== 'cancelled';

  return (
    <div className={`${styles.matchCard} ${compact ? styles.matchCardCompact : ''} ${isLive ? styles.matchLive : ''}`}>
      <div className={styles.matchHeader}>
        <span className={styles.matchNum}>M{match.matchNumber}</span>
        <span className={styles.matchStatus} style={{ color: st.color }}>
          {isLive && <span className={styles.liveDot} />}
          {st.label}
        </span>
      </div>
      <div className={styles.matchups}>
        <div className={`${styles.matchup} ${match.winnerId === p1?.id ? styles.winner : ''}`}>
          <Avatar p={p1} logo={p1?.id ? logos[p1.id] : undefined} size={20} />
          <span className={styles.participantName}>{p1?.name ?? 'TBD'}</span>
          {showScore && <span className={styles.score}>{match.score1 ?? 0}</span>}
        </div>
        <div className={styles.vs}>VS</div>
        <div className={`${styles.matchup} ${match.winnerId === p2?.id ? styles.winner : ''}`}>
          <Avatar p={p2} logo={p2?.id ? logos[p2.id] : undefined} size={20} />
          <span className={styles.participantName}>{p2?.name ?? 'TBD'}</span>
          {showScore && <span className={styles.score}>{match.score2 ?? 0}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Shared view props ─────────────────────────────────────────────────────────
type ViewProps = {
  rounds: number[];
  matches: Match[];
  participants: Participant[];
  logos: Record<string, string>;
};

// ── Flow View (horizontal columns) ───────────────────────────────────────────
function FlowView({ rounds, matches, participants, logos }: ViewProps) {
  const maxRound = Math.max(...rounds);
  return (
    <div className={styles.bracket}>
      {rounds.map(round => (
        <div key={round} className={styles.round}>
          <p className={styles.roundLabel}>{getRoundLabel(round, maxRound)}</p>
          <div className={styles.roundMatches}>
            {matches
              .filter(m => m.round === round)
              .sort((a, b) => a.matchNumber - b.matchNumber)
              .map(m => (
                <MatchCard key={m.id} match={m} participants={participants} logos={logos} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tree View (visual bracket with connectors) ────────────────────────────────
function TreeView({ rounds, matches, participants, logos }: ViewProps) {
  const maxRound = Math.max(...rounds);
  const baseRows = Math.pow(2, maxRound - 1);
  const totalTreeHeight = baseRows * SLOT_UNIT;

  return (
    <div className={styles.treeBracketScroll}>
      <div className={styles.treeBracket}>
        {rounds.map((round, rIdx) => {
          const roundMatches = matches
            .filter(m => m.round === round)
            .sort((a, b) => a.matchNumber - b.matchNumber);
          const spanRows = Math.pow(2, round - 1);
          const roundSlotHeight = spanRows * SLOT_UNIT;
          const connectorHeight = roundSlotHeight / 2;

          return (
            <div key={round} className={styles.treeRound}>
              <p className={styles.roundLabel} style={{ textAlign: 'center' }}>
                {getRoundLabel(round, maxRound)}
              </p>
              <div
                className={styles.treeRoundBody}
                style={{
                  height: totalTreeHeight,
                  gridTemplateRows: `repeat(${baseRows}, ${SLOT_UNIT}px)`,
                }}
              >
                {roundMatches.map((match, idx) => (
                  <div
                    key={match.id}
                    className={styles.treeMatchSlot}
                    style={{
                      gridRow: `${idx * spanRows + 1} / span ${spanRows}`,
                    }}
                  >
                    {/* ← Horizontal left connector (from junction to match) */}
                    {rIdx > 0 && (
                      <div
                        className={styles.treeConnectorLeft}
                        style={{ left: -CONN_MID, width: CONN_MID }}
                      />
                    )}

                    <div className={styles.treeMatchCardWrap}>
                      <MatchCard match={match} participants={participants} logos={logos} compact />
                    </div>

                    {/* → Right connectors (horizontal exit + half vertical bracket) */}
                    {round < maxRound && (
                      <div className={styles.treeConnectorRight} style={{ right: -COL_GAP, width: COL_GAP }}>
                        {/* Horizontal exit to midpoint */}
                        <div className={styles.treeConnectorExit} style={{ width: CONN_MID }} />
                        {/* Half-vertical bracket: down for even idx, up for odd */}
                        <div
                          className={styles.treeConnectorVertical}
                          style={{
                            left: CONN_MID,
                            top: idx % 2 === 0 ? '50%' : `calc(50% - ${connectorHeight}px)`,
                            height: connectorHeight,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── List View (tabular match list) ────────────────────────────────────────────
function ListView({ rounds, matches, participants, logos }: ViewProps) {
  const maxRound = Math.max(...rounds);
  return (
    <div className={styles.listView}>
      {rounds.map(round => (
        <div key={round}>
          <p className={styles.listRoundLabel}>{getRoundLabel(round, maxRound)}</p>
          <div className={styles.listMatches}>
            {matches
              .filter(m => m.round === round)
              .sort((a, b) => a.matchNumber - b.matchNumber)
              .map(match => {
                const p1 = participants.find(p => p.id === match.participant1Id);
                const p2 = participants.find(p => p.id === match.participant2Id);
                const st = matchStatusStyles[match.status];
                const showScore = match.status !== 'scheduled' && match.status !== 'cancelled';
                return (
                  <div key={match.id} className={`${styles.listMatchRow} ${match.status === 'live' ? styles.listMatchLive : ''}`}>
                    <span className={styles.listMatchNum}>M{match.matchNumber}</span>

                    <div className={`${styles.listParticipant} ${match.winnerId === p1?.id ? styles.listWinner : ''}`}>
                      <Avatar p={p1} logo={p1?.id ? logos[p1.id] : undefined} size={24} />
                      <span className={styles.listName}>{p1?.name ?? 'TBD'}</span>
                      {showScore && <span className={styles.listScore}>{match.score1 ?? 0}</span>}
                    </div>

                    <span className={styles.listVs}>VS</span>

                    <div className={`${styles.listParticipant} ${match.winnerId === p2?.id ? styles.listWinner : ''}`}>
                      <Avatar p={p2} logo={p2?.id ? logos[p2.id] : undefined} size={24} />
                      <span className={styles.listName}>{p2?.name ?? 'TBD'}</span>
                      {showScore && <span className={styles.listScore}>{match.score2 ?? 0}</span>}
                    </div>

                    <span className={styles.listStatus} style={{ color: st.color }}>
                      {match.status === 'live' && <span className={styles.liveDot} />}
                      {st.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Participant Row (with logo upload) ────────────────────────────────────────
function ParticipantRow({
  participant,
  logo,
  onLogoUpload,
}: {
  participant: Participant;
  logo?: string;
  onLogoUpload: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onLogoUpload(file);
    e.target.value = '';
  };

  const icon = participant.status === 'confirmed'
    ? <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
    : participant.status === 'declined'
    ? <XCircle size={14} style={{ color: 'var(--red)' }} />
    : <Circle size={14} style={{ color: 'var(--text-3)' }} />;

  return (
    <div className={styles.participantRow}>
      {/* Clickable avatar → opens file picker */}
      <button
        className={styles.avatarBtn}
        onClick={() => fileInputRef.current?.click()}
        title={logo ? 'Change logo/photo' : 'Add logo or photo'}
        type="button"
      >
        <Avatar p={participant} logo={logo} size={36} />
        <div className={styles.avatarOverlay}>
          <Upload size={11} />
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {participant.seed != null && <span className={styles.seed}>#{participant.seed}</span>}
      {icon}

      <div className={styles.participantInfo}>
        <span className={styles.participantName2}>{participant.name}</span>
        <span className={styles.participantEmail}>{participant.email}</span>
      </div>

      <span className={styles.availBadge}>
        {participant.availability.length} slot{participant.availability.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TournamentDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { tournaments } = useApp();
  const tournament  = tournaments.find(t => t.id === id);

  const [bracketView, setBracketView] = useState<BracketView>('flow');
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [showShare, setShowShare] = useState(false);

  const handleLogoUpload = (participantId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        setLogos(prev => ({ ...prev, [participantId]: e.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!tournament) {
    return (
      <div className={styles.notFound}>
        <p>Tournament not found.</p>
        <button onClick={() => navigate('/dashboard')}>Go back</button>
      </div>
    );
  }

  const rounds         = [...new Set(tournament.matches.map(m => m.round))].sort((a, b) => a - b);
  const confirmedCount = tournament.participants.filter(p => p.status === 'confirmed').length;
  const liveMatches    = tournament.matches.filter(m => m.status === 'live');

  const viewButtons: { key: BracketView; label: string; Icon: React.ElementType }[] = [
    { key: 'flow', label: 'Flow', Icon: LayoutGrid },
    { key: 'tree', label: 'Tree', Icon: GitBranch  },
    { key: 'list', label: 'List', Icon: List       },
  ];

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
          <p className={styles.sub}>
            {tournament.game} · {tournament.format.replace(/-/g, ' ')} · by {tournament.organizerName}
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerMeta}>
            <div className={styles.metaItem}><Users size={14} />{confirmedCount}/{tournament.maxParticipants} players</div>
            <div className={styles.metaItem}><Clock size={14} />{tournament.startDate}</div>
            {liveMatches.length > 0 && (
              <div className={styles.metaItem} style={{ color: 'var(--red)' }}>
                <Zap size={14} />{liveMatches.length} match{liveMatches.length > 1 ? 'es' : ''} live
              </div>
            )}
          </div>
          <button className={styles.shareBtn} onClick={() => setShowShare(true)}>
            <Share2 size={15} /> Share
          </button>
        </div>
      </div>

      {showShare && <ShareModal tournament={tournament} onClose={() => setShowShare(false)} />}

      <div className={styles.content}>
        {/* ── Bracket ── */}
        <section className={styles.section}>
          <div className={styles.bracketHeader}>
            <h2 className={styles.sectionTitle}>Bracket</h2>
            {tournament.matches.length > 0 && (
              <div className={styles.viewSwitcher}>
                {viewButtons.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    className={`${styles.viewBtn} ${bracketView === key ? styles.viewBtnActive : ''}`}
                    onClick={() => setBracketView(key)}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {tournament.matches.length === 0 ? (
            <div className={styles.empty}>
              No matches yet — bracket will appear once the tournament starts.
            </div>
          ) : bracketView === 'flow' ? (
            <FlowView rounds={rounds} matches={tournament.matches} participants={tournament.participants} logos={logos} />
          ) : bracketView === 'tree' ? (
            <TreeView rounds={rounds} matches={tournament.matches} participants={tournament.participants} logos={logos} />
          ) : (
            <ListView rounds={rounds} matches={tournament.matches} participants={tournament.participants} logos={logos} />
          )}
        </section>

        {/* ── Participants ── */}
        <section className={styles.section}>
          <div className={styles.bracketHeader}>
            <h2 className={styles.sectionTitle}>Participants</h2>
            <span className={styles.logoHint}>
              <Upload size={11} /> Click an avatar to add a logo or photo
            </span>
          </div>
          <div className={styles.participantList}>
            {tournament.participants.map(p => (
              <ParticipantRow
                key={p.id}
                participant={p}
                logo={logos[p.id]}
                onLogoUpload={file => handleLogoUpload(p.id, file)}
              />
            ))}
          </div>
        </section>

        {/* ── Locations ── */}
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

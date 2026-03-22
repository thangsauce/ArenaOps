import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, MapPin, Clock, Zap,
  CheckCircle2, Circle, XCircle,
  LayoutGrid, List, GitBranch,
  Upload, Share2, ChevronDown,
} from 'lucide-react';
import { useApp } from '../store/store';
import type { Match, Participant } from '../types';
import styles from './TournamentDetail.module.css';
import { formatDate } from '../utils/time';

const ShareModal = lazy(() => import('../components/ShareModal'));

// ── Constants ─────────────────────────────────────────────────────────────────
const SLOT_UNIT = 140; // height (px) of one R1 bracket slot
const COL_GAP   = 44;  // horizontal gap between tree columns
const CONN_MID  = 22;  // COL_GAP / 2 — where the vertical connector sits

type BracketView = 'flow' | 'tree' | 'list';

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

const matchStatusStyles: Record<string, { color: string; bg: string; border: string; label: string }> = {
  completed: { color: 'var(--text-3)', bg: 'var(--bg-3)', border: 'var(--border)', label: 'Done'      },
  live:      { color: 'var(--red)',    bg: 'rgba(255,71,87,0.10)', border: 'rgba(255,71,87,0.45)', label: 'Live'      },
  scheduled: { color: 'var(--blue)',   bg: 'rgba(79,172,254,0.10)', border: 'rgba(79,172,254,0.35)', label: 'Scheduled' },
  delayed:   { color: 'var(--amber)',   bg: 'var(--amber-dim)', border: 'rgba(var(--amber-rgb),0.4)', label: 'Delayed'   },
  cancelled: { color: 'var(--text-3)', bg: 'var(--bg-3)', border: 'var(--border)', label: 'Cancelled' },
};

function getRoundLabel(round: number, maxRound: number): string {
  if (round === maxRound)     return 'Grand Final';
  if (round === maxRound - 1) return 'Semifinals';
  if (round === maxRound - 2) return 'Quarterfinals';
  return `Round ${round}`;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ p, logo, size = 28, label }: { p: Participant | undefined; logo?: string; size?: number; label?: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={label ?? p?.name ?? ''}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  const name = label ?? p?.name ?? '?';
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

function getEntryLabel(participant: Participant | undefined, teamMode: boolean) {
  if (!participant) return 'TBD';
  if (!teamMode) return participant.name;
  return participant.team?.trim() || participant.name;
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ match, participants, logos, compact = false, teamMode = false }: {
  match: Match; participants: Participant[]; logos: Record<string, string>; compact?: boolean; teamMode?: boolean;
}) {
  const p1 = participants.find(p => p.id === match.participant1Id);
  const p2 = participants.find(p => p.id === match.participant2Id);
  const st = matchStatusStyles[match.status];
  const isLive = match.status === 'live';
  const showScore = match.status !== 'scheduled' && match.status !== 'cancelled';
  const p1Label = getEntryLabel(p1, teamMode);
  const p2Label = getEntryLabel(p2, teamMode);

  return (
    <div className={`${styles.matchCard} ${compact ? styles.matchCardCompact : ''} ${isLive ? styles.matchLive : ''}`}>
      <div className={styles.matchHeader}>
        <span className={styles.matchNum}>Match {match.matchNumber}</span>
        <span className={styles.matchStatus} style={{ color: st.color, background: st.bg, borderColor: st.border }}>
          {isLive && <span className={styles.liveDot} />}
          {st.label}
        </span>
      </div>
      <div className={styles.matchups}>
        <div className={`${styles.matchup} ${match.winnerId === p1?.id ? styles.winner : ''}`}>
          <Avatar p={p1} logo={p1?.id ? logos[p1.id] : undefined} size={20} label={p1Label} />
          <span className={styles.participantName}>{p1Label}</span>
          {showScore && <span className={styles.score}>{match.score1 ?? 0}</span>}
        </div>
        <div className={styles.vs}>VS</div>
        <div className={`${styles.matchup} ${match.winnerId === p2?.id ? styles.winner : ''}`}>
          <Avatar p={p2} logo={p2?.id ? logos[p2.id] : undefined} size={20} label={p2Label} />
          <span className={styles.participantName}>{p2Label}</span>
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
  teamMode?: boolean;
};

type TeamGroup = {
  name: string;
  members: Participant[];
};

type ChampionInfo = {
  participant: Participant;
  label: string;
  logo?: string;
};

function getChampionInfo(matches: Match[], participants: Participant[], logos: Record<string, string>, teamMode: boolean): ChampionInfo | null {
  if (matches.length === 0) return null;
  const finalRound = Math.max(...matches.map(match => match.round));
  const finalMatch = matches
    .filter(match => match.round === finalRound)
    .sort((a, b) => a.matchNumber - b.matchNumber)[0];

  if (!finalMatch?.winnerId || finalMatch.status !== 'completed') return null;
  const winner = participants.find(participant => participant.id === finalMatch.winnerId);
  if (!winner) return null;

  return {
    participant: winner,
    label: getEntryLabel(winner, teamMode),
    logo: logos[winner.id],
  };
}

function ChampionCard({ champion }: { champion: ChampionInfo }) {
  return (
    <div className={styles.championCard}>
      <span className={styles.championEyebrow}>Winner</span>
      <div className={styles.championBody}>
        <Avatar p={champion.participant} logo={champion.logo} size={32} label={champion.label} />
        <div className={styles.championInfo}>
          <span className={styles.championTitle}>Champion</span>
          <span className={styles.championName}>{champion.label}</span>
        </div>
      </div>
    </div>
  );
}

// ── Flow View (horizontal columns) ───────────────────────────────────────────
function FlowView({ rounds, matches, participants, logos, teamMode = false }: ViewProps) {
  const maxRound = Math.max(...rounds);
  const champion = getChampionInfo(matches, participants, logos, teamMode);
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
                <MatchCard key={m.id} match={m} participants={participants} logos={logos} teamMode={teamMode} />
              ))}
          </div>
        </div>
      ))}
      {champion && (
        <div className={styles.championColumn}>
          <p className={styles.roundLabel}>Winner</p>
          <ChampionCard champion={champion} />
        </div>
      )}
    </div>
  );
}

// ── Tree View (visual bracket with connectors) ────────────────────────────────
function TreeView({ rounds, matches, participants, logos, teamMode = false }: ViewProps) {
  const maxRound = Math.max(...rounds);
  const baseRows = Math.pow(2, maxRound - 1);
  const totalTreeHeight = baseRows * SLOT_UNIT;
  const champion = getChampionInfo(matches, participants, logos, teamMode);

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
                      <MatchCard match={match} participants={participants} logos={logos} compact teamMode={teamMode} />
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
        {champion && (
          <div className={styles.treeChampionColumn}>
            <p className={styles.roundLabel} style={{ textAlign: 'center' }}>
              Winner
            </p>
            <div className={styles.treeChampionSlot} style={{ height: totalTreeHeight }}>
              <div className={styles.treeChampionConnector} />
              <div className={styles.treeChampionCardWrap}>
                <ChampionCard champion={champion} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── List View (tabular match list) ────────────────────────────────────────────
function ListView({ rounds, matches, participants, logos, teamMode = false }: ViewProps) {
  const maxRound = Math.max(...rounds);
  const champion = getChampionInfo(matches, participants, logos, teamMode);
  return (
    <div className={styles.listView}>
      {champion && <ChampionCard champion={champion} />}
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
                const p1Label = getEntryLabel(p1, teamMode);
                const p2Label = getEntryLabel(p2, teamMode);
                return (
                  <div key={match.id} className={`${styles.listMatchRow} ${match.status === 'live' ? styles.listMatchLive : ''}`}>
                    <span className={styles.listMatchNum}>Match {match.matchNumber}</span>

                    <div className={`${styles.listParticipant} ${match.winnerId === p1?.id ? styles.listWinner : ''}`}>
                      <Avatar p={p1} logo={p1?.id ? logos[p1.id] : undefined} size={24} label={p1Label} />
                      <span className={styles.listName}>{p1Label}</span>
                      {showScore && <span className={styles.listScore}>{match.score1 ?? 0}</span>}
                    </div>

                    <span className={styles.listVs}>VS</span>

                    <div className={`${styles.listParticipant} ${match.winnerId === p2?.id ? styles.listWinner : ''}`}>
                      <Avatar p={p2} logo={p2?.id ? logos[p2.id] : undefined} size={24} label={p2Label} />
                      <span className={styles.listName}>{p2Label}</span>
                      {showScore && <span className={styles.listScore}>{match.score2 ?? 0}</span>}
                    </div>

                    <span className={styles.listStatus} style={{ color: st.color, background: st.bg, borderColor: st.border }}>
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
  teamMode = false,
  memberIndex,
}: {
  participant: Participant;
  logo?: string;
  onLogoUpload: (file: File) => void;
  teamMode?: boolean;
  memberIndex?: number;
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
  const entryLabel = getEntryLabel(participant, teamMode);
  const secondaryLabel = teamMode && participant.team?.trim()
    ? participant.name
    : participant.email;

  return (
    <div className={styles.participantRow}>
      {/* Clickable avatar → opens file picker */}
      <button
        className={styles.avatarBtn}
        onClick={() => fileInputRef.current?.click()}
        title={logo ? 'Change logo/photo' : 'Add logo or photo'}
        type="button"
      >
        <Avatar p={participant} logo={logo} size={36} label={entryLabel} />
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

      {memberIndex != null ? (
        <span className={styles.seed}>{memberIndex}.</span>
      ) : participant.seed != null ? (
        <span className={styles.seed}>#{participant.seed}</span>
      ) : null}
      {icon}

      <div className={styles.participantInfo}>
        <span className={styles.participantName2}>{entryLabel}</span>
        <span className={styles.participantEmail}>{secondaryLabel}</span>
      </div>

      <span className={styles.availBadge}>
        {participant.availability.length} time block{participant.availability.length > 1 ? 's' : ''}
      </span>
    </div>
  );
}

function TeamRow({
  team,
  logos,
  expanded,
  onToggle,
  onLogoUpload,
}: {
  team: TeamGroup;
  logos: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
  onLogoUpload: (participantId: string, file: File) => void;
}) {
  const primaryMember = team.members[0];
  const confirmedMembers = team.members.filter(member => member.status === 'confirmed').length;

  return (
    <div className={styles.teamCard}>
      <button type="button" className={styles.teamHeader} onClick={onToggle}>
        <div className={styles.teamIdentity}>
          <Avatar
            p={primaryMember}
            logo={primaryMember?.id ? logos[primaryMember.id] : undefined}
            size={36}
            label={team.name}
          />
          <div className={styles.teamInfo}>
            <span className={styles.teamName}>{team.name}</span>
            <span className={styles.teamMeta}>
              {team.members.length} member{team.members.length !== 1 ? 's' : ''} · {confirmedMembers} confirmed
            </span>
          </div>
        </div>
        <div className={styles.teamHeaderRight}>
          <ChevronDown size={16} className={`${styles.teamChevron} ${expanded ? styles.teamChevronOpen : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className={styles.teamMembers}>
          {team.members.map((member, index) => (
            <ParticipantRow
              key={member.id}
              participant={member}
              logo={member.id ? logos[member.id] : undefined}
              onLogoUpload={file => onLogoUpload(member.id, file)}
              teamMode={false}
              memberIndex={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TournamentDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { tournaments, settings } = useApp();
  const tournament  = tournaments.find(t => t.id === id);

  const [bracketView, setBracketView] = useState<BracketView>(settings.bracketPrefs.defaultView);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [showShare, setShowShare] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  useEffect(() => {
    setBracketView(settings.bracketPrefs.defaultView);
  }, [settings.bracketPrefs.defaultView]);

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

  const participants   = tournament.participants ?? [];
  const matches        = tournament.matches ?? [];
  const locations      = tournament.locations ?? [];
  const rounds         = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const confirmedCount = participants.filter(p => p.status === 'confirmed').length;
  const liveMatches    = matches.filter(m => m.status === 'live');
  const isIndividualGame = INDIVIDUAL_GAMES.has(tournament.game.toLowerCase());
  const rosterLabel = isIndividualGame ? 'Participants' : 'Teams';
  const countLabel = isIndividualGame ? 'players' : 'teams';
  const teamGroups: TeamGroup[] = !isIndividualGame
    ? participants.reduce<TeamGroup[]>((groups, participant) => {
        const teamName = getEntryLabel(participant, true);
        const existingGroup = groups.find(group => group.name === teamName);
        if (existingGroup) {
          existingGroup.members.push(participant);
        } else {
          groups.push({ name: teamName, members: [participant] });
        }
        return groups;
      }, [])
    : [];

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
            <div className={styles.metaItem}><Users size={14} />{confirmedCount}/{tournament.maxParticipants} {countLabel}</div>
            <div className={styles.metaItem}><Clock size={14} />{formatDate(tournament.startDate)}</div>
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

      {showShare && (
        <Suspense fallback={null}>
          <ShareModal tournament={tournament} onClose={() => setShowShare(false)} />
        </Suspense>
      )}

      <div className={styles.content}>
        {/* ── Bracket ── */}
        <section className={styles.section}>
          <div className={styles.bracketHeader}>
            <h2 className={styles.sectionTitle}>Bracket</h2>
            {matches.length > 0 && (
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

          {matches.length === 0 ? (
            <div className={styles.empty}>
              No matches yet — bracket will appear once the tournament starts.
            </div>
          ) : bracketView === 'flow' ? (
            <FlowView rounds={rounds} matches={matches} participants={participants} logos={logos} teamMode={!isIndividualGame} />
          ) : bracketView === 'tree' ? (
            <TreeView rounds={rounds} matches={matches} participants={participants} logos={logos} teamMode={!isIndividualGame} />
          ) : (
            <ListView rounds={rounds} matches={matches} participants={participants} logos={logos} teamMode={!isIndividualGame} />
          )}
        </section>

        {/* ── Roster ── */}
        <section className={styles.section}>
          <div className={styles.bracketHeader}>
            <h2 className={styles.sectionTitle}>{rosterLabel}</h2>
            <span className={styles.logoHint}>
              <Upload size={11} /> Click an avatar to add a logo or photo
            </span>
          </div>
          <div className={styles.participantList}>
            {isIndividualGame ? (
              participants.map(p => (
                <ParticipantRow
                  key={p.id}
                  participant={p}
                  logo={logos[p.id]}
                  onLogoUpload={file => handleLogoUpload(p.id, file)}
                  teamMode={false}
                />
              ))
            ) : (
              teamGroups.map(team => (
                <TeamRow
                  key={team.name}
                  team={team}
                  logos={logos}
                  expanded={expandedTeams.includes(team.name)}
                  onToggle={() =>
                    setExpandedTeams(prev =>
                      prev.includes(team.name)
                        ? prev.filter(name => name !== team.name)
                        : [...prev, team.name],
                    )
                  }
                  onLogoUpload={handleLogoUpload}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Locations ── */}
        {locations.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Locations</h2>
            <div className={styles.locationGrid}>
              {locations.map(l => (
                <div key={l.id} className={`${styles.locationCard} ${!l.available ? styles.unavailable : ''}`}>
                  <MapPin size={14} />
                  <div>
                    <p className={styles.locName}>{l.name}</p>
                    <p className={styles.locBuilding}>{l.building} · Cap. {l.capacity}</p>
                  </div>
                  <span className={styles.locStatus} style={{ color: l.available ? 'var(--accent)' : 'var(--red)' }}>
                    {l.available ? 'Available' : 'Booked'}
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

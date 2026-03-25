import { useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Mail, Plus, Search, Trash2, User, Users, XCircle } from 'lucide-react';
import { useApp } from '../store/store';
import type { Participant, ParticipantStatus } from '../types';
import styles from './Participants.module.css';
import { useToast } from '../components/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

type FilterStatus = 'all' | ParticipantStatus;
type RosterView = 'team' | 'player';
type InviteMode = 'player' | 'team';
const REMINDER_COOLDOWN_MS = 30_000;

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

const statusIcon = (s: ParticipantStatus) => {
  if (s === 'confirmed') return <CheckCircle2 size={14} className={styles.iconConfirmed} />;
  if (s === 'declined') return <XCircle size={14} className={styles.iconDeclined} />;
  return <Circle size={14} className={styles.iconPending} />;
};

const statusLabel: Record<ParticipantStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  declined: 'Declined',
};

interface ParticipantWithTournament extends Participant {
  tournamentName: string;
  tournamentId: string;
  game: string;
  isIndividualGame: boolean;
}

interface TeamWithTournament {
  key: string;
  teamName: string;
  tournamentName: string;
  tournamentId: string;
  game: string;
  members: ParticipantWithTournament[];
  status: ParticipantStatus;
  availabilityCount: number;
}

export default function Participants() {
  const { tournaments, settings, removeParticipant } = useApp();
  const { hideDeclined } = settings.participantPrefs;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMode, setInviteMode] = useState<InviteMode>('player');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteTeamName, setInviteTeamName] = useState('');
  const [inviteMemberCount, setInviteMemberCount] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?.id ?? '');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [rowStatuses, setRowStatuses] = useState<Record<string, ParticipantStatus>>({});
  const [viewMode, setViewMode] = useState<RosterView>('team');
  const viewToggleRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const summaryFilterRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const toast = useToast();
  const [lastReminderAt, setLastReminderAt] = useState<Record<string, number>>({});
  const [confirmRemove, setConfirmRemove] = useState<{
    participantIds: string[];
    tournamentId: string;
    name: string;
    kind: 'participant' | 'team';
  } | null>(null);

  const parsedInviteMemberCount = inviteMemberCount.trim() === '' ? 0 : Number(inviteMemberCount);

  const updateInviteMemberCount = (next: number) => {
    if (!Number.isFinite(next)) return;
    setInviteMemberCount(next <= 0 ? '' : String(Math.floor(next)));
  };

  const handleInviteMemberCountChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setInviteMemberCount(value);
    }
  };

  // Flatten all participants across tournaments
  const allParticipants: ParticipantWithTournament[] = tournaments.flatMap(t =>
    t.participants.map(p => ({
      ...p,
      tournamentName: t.name,
      tournamentId: t.id,
      game: t.game,
      isIndividualGame: INDIVIDUAL_GAMES.has(t.game.toLowerCase()),
    }))
  );

  const allTeams: TeamWithTournament[] = tournaments
    .filter(t => !INDIVIDUAL_GAMES.has(t.game.toLowerCase()))
    .flatMap(tournament => {
      const groupedTeams = tournament.participants.reduce<Record<string, ParticipantWithTournament[]>>((acc, participant) => {
        const teamName = participant.team?.trim() || participant.name;
        if (!acc[teamName]) acc[teamName] = [];
        acc[teamName].push({
          ...participant,
          tournamentName: tournament.name,
          tournamentId: tournament.id,
          game: tournament.game,
          isIndividualGame: false,
        });
        return acc;
      }, {});

      return Object.entries(groupedTeams).map(([teamName, members]) => {
        const memberStatuses = members.map(member => member.status);
        const status: ParticipantStatus =
          memberStatuses.some(memberStatus => memberStatus === 'confirmed')
            ? 'confirmed'
            : memberStatuses.some(memberStatus => memberStatus === 'pending')
            ? 'pending'
            : 'declined';

        return {
          key: `${tournament.id}-${teamName}`,
          teamName,
          tournamentName: tournament.name,
          tournamentId: tournament.id,
          game: tournament.game,
          members,
          status,
          availabilityCount: members.reduce((sum, member) => sum + member.availability.length, 0),
        };
      });
    });

  const filteredParticipants = allParticipants.filter(p => {
    if (hideDeclined && p.status === 'declined') return false;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filteredTeams = allTeams.filter(team => {
    if (hideDeclined && team.status === 'declined') return false;
    const needle = search.toLowerCase();
    const matchesSearch =
      team.teamName.toLowerCase().includes(needle) ||
      team.tournamentName.toLowerCase().includes(needle) ||
      team.members.some(member =>
        member.name.toLowerCase().includes(needle) ||
        member.email.toLowerCase().includes(needle),
      );
    const matchesFilter = filter === 'all' || team.status === filter;
    return matchesSearch && matchesFilter;
  });

  const activeRows = viewMode === 'team' ? filteredTeams : filteredParticipants;

  const countSource = viewMode === 'team' ? allTeams : allParticipants;

  const counts = {
    all: countSource.length,
    confirmed: countSource.filter(entry => entry.status === 'confirmed').length,
    pending: countSource.filter(entry => entry.status === 'pending').length,
    declined: countSource.filter(entry => entry.status === 'declined').length,
  };

  const participantStats = (() => {
    const visibleParticipants = hideDeclined
      ? allParticipants.filter(p => p.status !== 'declined')
      : allParticipants;

    const matchAssignments = new Set<string>();

    tournaments.forEach(tournament => {
      tournament.matches.forEach(match => {
        if (match.participant1Id) matchAssignments.add(`${match.participant1Id}-${tournament.id}`);
        if (match.participant2Id) matchAssignments.add(`${match.participant2Id}-${tournament.id}`);
      });
    });

    const readyToSchedule = visibleParticipants.filter(
      participant => participant.status === 'confirmed' && participant.availability.length > 0
    ).length;

    const needsFollowUp = visibleParticipants.filter(
      participant => participant.status !== 'declined' && participant.availability.length === 0
    ).length;

    const assignedToMatches = visibleParticipants.filter(
      participant => matchAssignments.has(`${participant.id}-${participant.tournamentId}`)
    ).length;

    const availabilityAverage = visibleParticipants.length > 0
      ? visibleParticipants.reduce((sum, participant) => sum + participant.availability.length, 0) / visibleParticipants.length
      : 0;

    return {
      readyToSchedule,
      needsFollowUp,
      assignedToMatches,
      availabilityAverage,
    };
  })();

  const handleSendInvite = () => {
    const isValid = inviteMode === 'player'
      ? inviteName.trim() && inviteEmail.trim()
      : inviteTeamName.trim() && inviteName.trim() && inviteEmail.trim();
    if (!isValid) return;
    setShowInviteModal(false);
    setInviteMode('player');
    setInviteName('');
    setInviteEmail('');
    setInviteTeamName('');
    setInviteMemberCount('');
  };

  const handleViewToggleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    nextView: RosterView,
    nextIndex: number,
  ) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setViewMode(nextView);
    viewToggleRefs.current[nextIndex]?.focus();
  };

  const summaryFilters: FilterStatus[] = ['all', 'confirmed', 'pending', 'declined'];

  const handleSummaryFilterKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      return;
    }
    e.preventDefault();
    const isForward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const nextIndex = isForward
      ? (index + 1) % summaryFilters.length
      : (index - 1 + summaryFilters.length) % summaryFilters.length;
    setFilter(summaryFilters[nextIndex]);
    summaryFilterRefs.current[nextIndex]?.focus();
  };

  const sendReminder = (targetKey: string, label: string) => {
    const now = Date.now();
    const lastSent = lastReminderAt[targetKey] ?? 0;
    const remainingMs = REMINDER_COOLDOWN_MS - (now - lastSent);

    if (remainingMs > 0) {
      toast(
        `Reminder already sent to ${label}. Try again in ${Math.ceil(remainingMs / 1000)}s.`,
        'error',
      );
      return;
    }

    setLastReminderAt((prev) => ({ ...prev, [targetKey]: now }));
    toast(`Reminder sent to ${label}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Participants</h1>
          <p className={styles.sub}>{counts.all} total across {tournaments.length} tournaments</p>
        </div>
        <button className={styles.inviteBtn} onClick={() => setShowInviteModal(true)}>
          <Plus size={15} /> Invite
        </button>
      </div>

      <div className={styles.viewToggle} role="tablist" aria-label="Participant view">
        <button
          ref={(node) => {
            viewToggleRefs.current[0] = node;
          }}
          className={`${styles.viewToggleBtn} ${viewMode === 'team' ? styles.viewToggleBtnActive : ''}`}
          onClick={() => setViewMode('team')}
          onKeyDown={(e) => handleViewToggleKeyDown(e, 'player', 1)}
          role="tab"
          aria-selected={viewMode === 'team'}
          tabIndex={viewMode === 'team' ? 0 : -1}
        >
          <Users size={13} />
          <span>By Team</span>
        </button>
        <button
          ref={(node) => {
            viewToggleRefs.current[1] = node;
          }}
          className={`${styles.viewToggleBtn} ${viewMode === 'player' ? styles.viewToggleBtnActive : ''}`}
          onClick={() => setViewMode('player')}
          onKeyDown={(e) => handleViewToggleKeyDown(e, 'team', 0)}
          role="tab"
          aria-selected={viewMode === 'player'}
          tabIndex={viewMode === 'player' ? 0 : -1}
        >
          <User size={13} />
          <span>By Player</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryRow} role="tablist" aria-label="Participant status filters">
        {summaryFilters.map((s, index) => (
          <button
            ref={(node) => {
              summaryFilterRefs.current[index] = node;
            }}
            key={s}
            className={`${styles.summaryCard} ${filter === s ? styles.summaryActive : ''}`}
            data-status={s}
            onClick={() => setFilter(s)}
            onKeyDown={(e) => handleSummaryFilterKeyDown(e, index)}
            role="tab"
            aria-selected={filter === s}
            tabIndex={filter === s ? 0 : -1}
          >
            <span className={styles.summaryLabel}>{s === 'all' ? 'Total' : statusLabel[s as ParticipantStatus]}</span>
            <span className={styles.summaryCount} data-status={s}>{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue} data-tone="accent">{participantStats.readyToSchedule}</span>
          <span className={styles.statLabel}>Ready to schedule</span>
          <span className={styles.statHint}>Confirmed with availability submitted</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} data-tone="blue">{participantStats.assignedToMatches}</span>
          <span className={styles.statLabel}>Assigned to matches</span>
          <span className={styles.statHint}>Already placed into the bracket</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue} data-tone="amber">{participantStats.needsFollowUp}</span>
          <span className={styles.statLabel}>Need follow-up</span>
          <span className={styles.statHint}>No availability on file yet</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{participantStats.availabilityAverage.toFixed(1)}</span>
          <span className={styles.statLabel}>Avg. time slots</span>
          <span className={styles.statHint}>Availability per visible participant</span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder={viewMode === 'team' ? 'Search by team, player, or email...' : 'Search by name or email...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {allParticipants.length === 0 && (
        <EmptyState
          icon={Users}
          title="No participants yet"
          description="Add players or teams to get started"
        />
      )}
      <div className={styles.table}>
        <div className={`${styles.tableHead} ${viewMode === 'team' ? styles.tableHeadTeam : ''}`}>
          {viewMode === 'team' ? (
            <>
              <span>Team</span>
              <span>Tournament</span>
              <span>Status</span>
              <span>Members</span>
              <span></span>
            </>
          ) : (
            <>
              <span>Player</span>
              <span>Tournament</span>
              <span>Status</span>
              <span>Availability</span>
              <span></span>
            </>
          )}
        </div>

        {activeRows.length === 0 && (
          <div className={styles.empty}>No participants match your search.</div>
        )}

        {viewMode === 'player' && filteredParticipants.map(p => {
          const rowKey = `${p.id}-${p.tournamentId}`;
          const currentStatus = rowStatuses[rowKey] ?? p.status;
          return (
            <div key={rowKey} className={styles.tableGroup}>
              <div
                className={styles.tableRow}
                onClick={() => setExpandedRow(expandedRow === rowKey ? null : rowKey)}
              >
                <div className={styles.playerCell}>
                  <div className={styles.avatar}>{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div>
                    <p className={styles.playerName}>{p.name}</p>
                    <p className={styles.playerEmail}>{p.email}</p>
                  </div>
                </div>
                <span className={styles.tournamentName}>{p.tournamentName}</span>
                <div className={styles.statusCell}>
                  {statusIcon(currentStatus)}
                  <span data-status={currentStatus}>{statusLabel[currentStatus]}</span>
                </div>
                <div className={styles.availCell}>
                  {p.availability.length > 0 ? (
                    <span className={styles.availBadge}>{p.availability.length} slot{p.availability.length !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className={styles.noAvail}>Not set</span>
                  )}
                </div>
                <div className={styles.rowActions}>
                  <ChevronDown
                    size={14}
                    className={`${styles.chevron} ${expandedRow === rowKey ? styles.chevronOpen : ''}`}
                  />
                </div>
              </div>

              {expandedRow === rowKey && (
                <div className={styles.expandedRow}>
                  <div className={styles.expandedSection}>
                    <p className={styles.expandedLabel}>Seed</p>
                    <p className={styles.expandedValue}>{p.seed != null ? `#${p.seed}` : '—'}</p>
                  </div>
                  <div className={styles.expandedSection}>
                    <p className={styles.expandedLabel}>Status</p>
                    <select
                      className={styles.statusSelect}
                      value={currentStatus}
                      onChange={e => setRowStatuses(prev => ({ ...prev, [rowKey]: e.target.value as ParticipantStatus }))}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  <div className={styles.expandedActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        sendReminder(`participant:${p.tournamentId}:${p.id}`, p.name);
                      }}
                    >
                      <Mail size={13} /> Send Reminder
                    </button>
                    <button
                      className={styles.actionBtn}
                      style={{ color: 'var(--red)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmRemove({
                          participantIds: [p.id],
                          tournamentId: p.tournamentId,
                          name: p.name,
                          kind: 'participant',
                        });
                      }}
                    >
                      <Trash2 size={13} /> Remove Player
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {viewMode === 'team' && filteredTeams.map(team => {
          const rowKey = team.key;
          return (
            <div key={rowKey} className={styles.tableGroup}>
              <div
                className={`${styles.tableRow} ${styles.tableRowTeam}`}
                onClick={() => setExpandedRow(expandedRow === rowKey ? null : rowKey)}
              >
                <div className={styles.playerCell}>
                  <div className={styles.avatar}>
                    {team.teamName.split(' ').map(word => word[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className={styles.playerName}>{team.teamName}</p>
                    <p className={styles.playerEmail}>{team.game}</p>
                  </div>
                </div>
                <span className={styles.tournamentName}>{team.tournamentName}</span>
                <div className={styles.statusCell}>
                  {statusIcon(team.status)}
                  <span data-status={team.status}>{statusLabel[team.status]}</span>
                </div>
                <div className={styles.availCell}>
                  <span className={styles.availBadge}>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                </div>
                <div className={styles.rowActions}>
                  <ChevronDown
                    size={14}
                    className={`${styles.chevron} ${expandedRow === rowKey ? styles.chevronOpen : ''}`}
                  />
                </div>
              </div>

              {expandedRow === rowKey && (
                <div className={`${styles.expandedRow} ${styles.teamExpandedRow}`}>
                  <div className={styles.expandedActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        sendReminder(`team:${team.tournamentId}:${team.teamName}`, team.teamName);
                      }}
                    >
                      <Mail size={13} /> Send Reminder
                    </button>
                    <button
                      className={styles.actionBtn}
                      style={{ color: 'var(--red)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmRemove({
                          participantIds: team.members.map((member) => member.id),
                          tournamentId: team.tournamentId,
                          name: team.teamName,
                          kind: 'team',
                        });
                      }}
                    >
                      <Trash2 size={13} /> Remove Team
                    </button>
                  </div>
                  {team.members.map((member, index) => {
                    const memberKey = `${member.id}-${member.tournamentId}`;
                    const currentStatus = rowStatuses[memberKey] ?? member.status;
                    return (
                      <div key={memberKey} className={styles.teamMemberCard}>
                        <div className={styles.teamMemberTop}>
                          <div className={styles.playerCell}>
                            <div className={styles.avatar}>{index + 1}</div>
                            <div>
                              <p className={styles.playerName}>{member.name}</p>
                              <p className={styles.playerEmail}>{member.email}</p>
                            </div>
                          </div>
                          <div className={styles.teamMemberStatus}>
                            <div className={styles.statusCell}>
                              {statusIcon(currentStatus)}
                              <span data-status={currentStatus}>{statusLabel[currentStatus]}</span>
                            </div>
                            <select
                              className={styles.statusSelect}
                              value={currentStatus}
                              onChange={e => setRowStatuses(prev => ({ ...prev, [memberKey]: e.target.value as ParticipantStatus }))}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="pending">Pending</option>
                              <option value="declined">Declined</option>
                            </select>
                          </div>
                        </div>
                        <div className={styles.teamMemberMeta}>
                          <span className={styles.expandedValue}>
                            {member.seed != null ? `Seed #${member.seed}` : 'No seed'}
                          </span>
                          <span className={styles.availBadge}>
                            {member.availability.length} time block{member.availability.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Invite</h2>
            <p className={styles.modalSub}>
              {inviteMode === 'player'
                ? 'Send an availability confirmation request to a player.'
                : 'Send an invite to a team contact and track the team under one entry.'}
            </p>

            <div className={styles.modalToggle}>
              <button
                className={`${styles.modalToggleBtn} ${inviteMode === 'player' ? styles.modalToggleBtnActive : ''}`}
                onClick={() => setInviteMode('player')}
                type="button"
              >
                <User size={13} />
                <span>Player</span>
              </button>
              <button
                className={`${styles.modalToggleBtn} ${inviteMode === 'team' ? styles.modalToggleBtnActive : ''}`}
                onClick={() => setInviteMode('team')}
                type="button"
              >
                <Users size={13} />
                <span>Team</span>
              </button>
            </div>

            <div className={styles.modalField}>
              <label>{inviteMode === 'player' ? 'Player Name' : 'Captain / Contact Name'}</label>
              <input
                className={styles.modalInput}
                placeholder={inviteMode === 'player' ? 'Full name' : 'Team captain or organizer'}
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
              />
            </div>
            <div className={styles.modalField}>
              <label>{inviteMode === 'player' ? 'Email Address' : 'Captain / Contact Email'}</label>
              <input
                className={styles.modalInput}
                placeholder="student@ucf.edu"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            {inviteMode === 'team' && (
              <>
                <div className={styles.modalField}>
                  <label>Team Name</label>
                  <input
                    className={styles.modalInput}
                    placeholder="e.g. Neon Mirage"
                    value={inviteTeamName}
                    onChange={e => setInviteTeamName(e.target.value)}
                  />
                </div>
                <div className={styles.modalField}>
                  <label>Member Count</label>
                  <div className={styles.numberControl}>
                    <input
                      className={styles.numberInput}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Optional"
                      value={inviteMemberCount}
                      onChange={e => handleInviteMemberCountChange(e.target.value)}
                    />
                    <div className={styles.numberButtons}>
                      <button
                        className={styles.numberButton}
                        type="button"
                        aria-label="Increase member count"
                        onClick={() => updateInviteMemberCount(parsedInviteMemberCount + 1)}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        className={styles.numberButton}
                        type="button"
                        aria-label="Decrease member count"
                        onClick={() => updateInviteMemberCount(Math.max(0, parsedInviteMemberCount - 1))}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className={styles.modalField}>
              <label>Tournament</label>
              <div className={styles.selectWrap}>
                <select className={`${styles.modalInput} ${styles.selectInput}`} value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}>
                  {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <ChevronDown size={16} className={styles.selectChevron} aria-hidden="true" />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button
                className={styles.sendBtn}
                onClick={handleSendInvite}
                disabled={inviteMode === 'player'
                  ? !inviteName.trim() || !inviteEmail.trim()
                  : !inviteTeamName.trim() || !inviteName.trim() || !inviteEmail.trim()}
              >
                <Mail size={14} /> Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmRemove !== null}
        title={
          confirmRemove?.kind === 'team'
            ? 'Remove team?'
            : 'Remove player?'
        }
        description={
          confirmRemove?.kind === 'team'
            ? 'This will remove the entire team and all of its members from the tournament.'
            : 'This will remove them from the tournament.'
        }
        confirmLabel={confirmRemove?.kind === 'team' ? 'Remove Team' : 'Remove Player'}
        onConfirm={() => {
          if (!confirmRemove) return;
          confirmRemove.participantIds.forEach((participantId) => {
            removeParticipant(confirmRemove.tournamentId, participantId);
          });
          toast(
            confirmRemove.kind === 'team'
              ? `${confirmRemove.name} removed`
              : `${confirmRemove.name} removed`,
          );
          setConfirmRemove(null);
        }}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}

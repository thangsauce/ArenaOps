import { useState } from 'react';
import { CheckCircle2, Circle, XCircle, Search, Plus, Mail, Trash2, ChevronDown } from 'lucide-react';
import { useApp } from '../store/store';
import type { Participant, ParticipantStatus } from '../types';
import styles from './Participants.module.css';

type FilterStatus = 'all' | ParticipantStatus;

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
}

export default function Participants() {
  const { tournaments, settings } = useApp();
  const { hideDeclined } = settings.participantPrefs;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?.id ?? '');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [rowStatuses, setRowStatuses] = useState<Record<string, ParticipantStatus>>({});

  // Flatten all participants across tournaments
  const allParticipants: ParticipantWithTournament[] = tournaments.flatMap(t =>
    t.participants.map(p => ({ ...p, tournamentName: t.name, tournamentId: t.id }))
  );

  const filtered = allParticipants.filter(p => {
    if (hideDeclined && p.status === 'declined') return false;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: allParticipants.length,
    confirmed: allParticipants.filter(p => p.status === 'confirmed').length,
    pending: allParticipants.filter(p => p.status === 'pending').length,
    declined: allParticipants.filter(p => p.status === 'declined').length,
  };

  const handleSendInvite = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Participants</h1>
          <p className={styles.sub}>{counts.all} total across {tournaments.length} tournaments</p>
        </div>
        <button className={styles.inviteBtn} onClick={() => setShowInviteModal(true)}>
          <Plus size={15} /> Invite Player
        </button>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryRow}>
        {(['all', 'confirmed', 'pending', 'declined'] as FilterStatus[]).map(s => (
          <button
            key={s}
            className={`${styles.summaryCard} ${filter === s ? styles.summaryActive : ''}`}
            onClick={() => setFilter(s)}
          >
            <span className={styles.summaryCount} data-status={s}>{counts[s]}</span>
            <span className={styles.summaryLabel}>{s === 'all' ? 'Total' : statusLabel[s as ParticipantStatus]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className={styles.table}>
        <div className={styles.tableHead}>
          <span>Player</span>
          <span>Tournament</span>
          <span>Status</span>
          <span>Availability</span>
          <span></span>
        </div>

        {filtered.length === 0 && (
          <div className={styles.empty}>No participants match your search.</div>
        )}

        {filtered.map(p => {
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
                    <button className={styles.actionBtn}>
                      <Mail size={13} /> Send Reminder
                    </button>
                    <button className={styles.actionBtn} style={{ color: 'var(--red)' }}>
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
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
            <h2 className={styles.modalTitle}>Invite Player</h2>
            <p className={styles.modalSub}>Send an availability confirmation request.</p>

            <div className={styles.modalField}>
              <label>Player Name</label>
              <input className={styles.modalInput} placeholder="Full name" value={inviteName} onChange={e => setInviteName(e.target.value)} />
            </div>
            <div className={styles.modalField}>
              <label>Email Address</label>
              <input className={styles.modalInput} placeholder="student@ucf.edu" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            </div>
            <div className={styles.modalField}>
              <label>Tournament</label>
              <select className={styles.modalInput} value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button
                className={styles.sendBtn}
                onClick={handleSendInvite}
                disabled={!inviteName.trim() || !inviteEmail.trim()}
              >
                <Mail size={14} /> Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

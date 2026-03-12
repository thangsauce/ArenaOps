import { useState, useEffect, useRef } from 'react';
import { MapPin, Users, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { useApp } from '../store/store';
import styles from './RoomBooking.module.css';

export default function RoomBooking() {
  const { tournaments, bookRoom } = useApp();
  const tournament = tournaments[0]; // Spring Valorant Open

  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justBooked, setJustBooked] = useState<string | null>(null);
  const bookedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (bookedTimerRef.current) clearTimeout(bookedTimerRef.current); };
  }, []);

  if (!tournament) return <div className={styles.page}><p style={{ padding: '2rem' }}>No tournaments available.</p></div>;

  const getConflicts = (locationId: string, matchId: string) => {
    // Check if any other match is already using this room in the same time block
    const match = tournament.matches.find(m => m.id === matchId);
    return tournament.matches.filter(m =>
      m.id !== matchId &&
      m.locationId === locationId &&
      m.timeBlockId === match?.timeBlockId &&
      m.status !== 'completed' && m.status !== 'cancelled'
    );
  };

  const handleBook = () => {
    if (!selectedMatch || !selectedRoom) return;
    bookRoom(tournament.id, selectedMatch, selectedRoom);
    setJustBooked(selectedRoom);
    setConfirmOpen(false);
    setSelectedMatch(null);
    setSelectedRoom(null);
    if (bookedTimerRef.current) clearTimeout(bookedTimerRef.current);
    bookedTimerRef.current = setTimeout(() => setJustBooked(null), 3000);
  };

  const getParticipantName = (id: string | null) => {
    if (!id) return 'TBD';
    return tournament.participants.find(p => p.id === id)?.name ?? 'TBD';
  };

  // Build occupancy map: locationId -> array of match ids using it
  const occupancy: Record<string, string[]> = {};
  tournament.matches.forEach(m => {
    if (m.locationId) {
      if (!occupancy[m.locationId]) occupancy[m.locationId] = [];
      occupancy[m.locationId].push(m.id);
    }
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Room Booking</h1>
          <p className={styles.sub}>Assign locations to matches · Conflict detection enabled</p>
        </div>
        <div className={styles.tournamentPill}>
          <span className={styles.pillDot} />
          {tournament.name}
        </div>
      </div>

      {justBooked && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={15} />
          Room assigned successfully. Participants notified.
        </div>
      )}

      <div className={styles.layout}>
        {/* Left: Matches needing rooms */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Matches</h2>
          <div className={styles.matchList}>
            {tournament.matches.map(m => {
              const loc = tournament.locations.find(l => l.id === m.locationId);
              const p1 = getParticipantName(m.participant1Id);
              const p2 = getParticipantName(m.participant2Id);
              const tb = tournament.timeBlocks.find(t => t.id === m.timeBlockId);
              const isSelected = selectedMatch === m.id;
              const isCompleted = m.status === 'completed';

              return (
                <div
                  key={m.id}
                  className={`${styles.matchCard} ${isSelected ? styles.matchSelected : ''} ${isCompleted ? styles.matchDone : ''}`}
                  onClick={() => !isCompleted && setSelectedMatch(isSelected ? null : m.id)}
                >
                  <div className={styles.matchTop}>
                    <span className={styles.matchLabel}>Round {m.round} · M{m.matchNumber}</span>
                    <span className={styles.matchStatus} data-status={m.status}>{m.status}</span>
                  </div>
                  <p className={styles.matchPlayers}>{p1} <span>vs</span> {p2}</p>
                  <div className={styles.matchMeta}>
                    {tb && <span className={styles.metaItem}><Clock size={11} />{tb.label} · {tb.start}</span>}
                    {loc
                      ? <span className={styles.metaItem} style={{ color: 'var(--accent)' }}><MapPin size={11} />{loc.name}</span>
                      : <span className={styles.metaItem} style={{ color: '#ffaa00' }}><AlertTriangle size={11} />No room</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Room grid */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            Locations
            {selectedMatch && <span className={styles.selectHint}>← click to assign</span>}
          </h2>
          <div className={styles.roomGrid}>
            {tournament.locations.map(loc => {
              const conflicts = selectedMatch ? getConflicts(loc.id, selectedMatch) : [];
              const hasConflict = conflicts.length > 0;
              const usedBy = occupancy[loc.id] ?? [];
              const isSelected = selectedRoom === loc.id;

              return (
                <div
                  key={loc.id}
                  className={`${styles.roomCard} ${!loc.available ? styles.roomUnavailable : ''} ${hasConflict ? styles.roomConflict : ''} ${isSelected ? styles.roomSelected : ''}`}
                  onClick={() => {
                    if (!selectedMatch || !loc.available) return;
                    if (hasConflict) return;
                    setSelectedRoom(loc.id);
                    setConfirmOpen(true);
                  }}
                >
                  <div className={styles.roomHeader}>
                    <div>
                      <p className={styles.roomName}>{loc.name}</p>
                      <p className={styles.roomBuilding}>{loc.building}</p>
                    </div>
                    <div className={styles.roomStatus}>
                      {!loc.available
                        ? <XCircle size={16} style={{ color: 'var(--red)' }} />
                        : hasConflict
                        ? <AlertTriangle size={16} style={{ color: '#ffaa00' }} />
                        : <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
                      }
                    </div>
                  </div>

                  <div className={styles.roomMeta}>
                    <span className={styles.roomCap}><Users size={12} />Cap. {loc.capacity}</span>
                    <span className={styles.roomUsage}>
                      {usedBy.length} match{usedBy.length !== 1 ? 'es' : ''} booked
                    </span>
                  </div>

                  {hasConflict && (
                    <div className={styles.conflictWarning}>
                      <AlertTriangle size={11} />
                      Conflict: {conflicts.length} match{conflicts.length > 1 ? 'es' : ''} in same slot
                    </div>
                  )}

                  {!loc.available && (
                    <div className={styles.conflictWarning} style={{ color: 'var(--red)', background: 'var(--red-dim)' }}>
                      <XCircle size={11} />
                      Unavailable — campus hold
                    </div>
                  )}

                  <div className={styles.roomStatusLabel} data-available={loc.available && !hasConflict}>
                    {!loc.available ? 'Unavailable' : hasConflict ? 'Conflict' : selectedMatch ? 'Click to assign' : 'Available'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Booking summary */}
          <div className={styles.bookingSummary}>
            <h3 className={styles.summaryTitle}>Booking Summary</h3>
            {tournament.locations.map(loc => {
              const booked = tournament.matches.filter(m => m.locationId === loc.id);
              if (booked.length === 0) return null;
              return (
                <div key={loc.id} className={styles.summaryRow}>
                  <span className={styles.summaryRoom}><MapPin size={12} />{loc.name}</span>
                  <div className={styles.summaryMatches}>
                    {booked.map(m => (
                      <span key={m.id} className={styles.summaryChip} data-status={m.status}>
                        R{m.round}M{m.matchNumber}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmOpen && selectedMatch && selectedRoom && (
        <div className={styles.overlay} onClick={() => setConfirmOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirm Room Assignment</h2>
            {(() => {
              const m = tournament.matches.find(x => x.id === selectedMatch)!;
              const loc = tournament.locations.find(x => x.id === selectedRoom)!;
              const p1 = getParticipantName(m.participant1Id);
              const p2 = getParticipantName(m.participant2Id);
              const tb = tournament.timeBlocks.find(t => t.id === m.timeBlockId);
              return (
                <>
                  <div className={styles.confirmDetails}>
                    <div className={styles.confirmRow}><span>Match</span><strong>{p1} vs {p2}</strong></div>
                    <div className={styles.confirmRow}><span>Time</span><strong>{tb?.label ?? '—'} · {tb?.start}</strong></div>
                    <div className={styles.confirmRow}><span>Room</span><strong>{loc.name}, {loc.building}</strong></div>
                    <div className={styles.confirmRow}><span>Capacity</span><strong>{loc.capacity} people</strong></div>
                  </div>
                  <p className={styles.confirmNote}>⚡ All participants will be notified within 30 seconds of this assignment.</p>
                  <div className={styles.modalActions}>
                    <button className={styles.cancelBtn} onClick={() => setConfirmOpen(false)}>Cancel</button>
                    <button className={styles.bookBtn} onClick={handleBook}>Confirm Booking</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

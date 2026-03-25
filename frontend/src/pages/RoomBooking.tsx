import { useState, useEffect, useRef } from 'react';
import { MapPin, Users, CheckCircle2, XCircle, AlertTriangle, Clock, LayoutGrid, Rows3, ChevronDown } from 'lucide-react';
import { useApp } from '../store/store';
import { formatTime } from '../utils/time';
import styles from './RoomBooking.module.css';
import { useToast } from '../components/useToast';

export default function RoomBooking() {
  const { tournaments, timePrefs, bookRoom } = useApp();
  const toast = useToast();
  const tournament = tournaments[0]; // Spring Valorant Open

  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justBooked, setJustBooked] = useState<string | null>(null);
  const [bookingView, setBookingView] = useState<'assign' | 'assignments'>('assign');
  const [expandedTimeBlocks, setExpandedTimeBlocks] = useState<string[]>(() =>
    tournament?.timeBlocks[0] ? [tournament.timeBlocks[0].id] : [],
  );
  const bookedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookingViewRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
    const conflicts = getConflicts(selectedRoom, selectedMatch);
    if (conflicts.length > 0) {
      toast('Room conflict detected in this time slot', 'error');
      return;
    }
    bookRoom(tournament.id, selectedMatch, selectedRoom);
    toast('Room assigned successfully');
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
  const formatSlotTime = (start: string, date: string) =>
    formatTime(start, date, timePrefs.format, timePrefs.timezone);

  // Build occupancy map: locationId -> array of match ids using it
  const occupancy: Record<string, string[]> = {};
  tournament.matches.forEach(m => {
    if (m.locationId) {
      if (!occupancy[m.locationId]) occupancy[m.locationId] = [];
      occupancy[m.locationId].push(m.id);
    }
  });

  const assignedMatches = tournament.matches.filter(m => m.locationId);
  const unassignedRooms = tournament.locations.filter(
    loc => !tournament.matches.some(m => m.locationId === loc.id),
  );
  const timeBlockBoards = tournament.timeBlocks.map(tb => ({
    timeBlock: tb,
    matches: tournament.matches.filter(m => m.timeBlockId === tb.id && m.status !== 'completed' && m.status !== 'cancelled'),
  }));
  const selectedMatchData = selectedMatch ? tournament.matches.find(m => m.id === selectedMatch) ?? null : null;

  const viewButtons = [
    { key: 'assign' as const, label: 'Assign', Icon: LayoutGrid },
    { key: 'assignments' as const, label: 'Room Availability', Icon: Rows3 },
  ];

  const handleBookingViewKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const nextIndex =
      e.key === 'ArrowRight'
        ? (index + 1) % viewButtons.length
        : (index - 1 + viewButtons.length) % viewButtons.length;
    const nextView = viewButtons[nextIndex];
    setBookingView(nextView.key);
    bookingViewRefs.current[nextIndex]?.focus();
  };

  const handleSelectableCardKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    onActivate: () => void,
  ) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onActivate();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerIntro}>
          <h1 className={styles.title}>Room Booking</h1>
          <p className={styles.sub}>Assign locations to matches · Conflict detection enabled</p>
          <div className={styles.viewSwitcher}>
            {viewButtons.map(({ key, label, Icon }, index) => (
              <button
                ref={(node) => {
                  bookingViewRefs.current[index] = node;
                }}
                key={key}
                className={`${styles.viewBtn} ${bookingView === key ? styles.viewBtnActive : ''}`}
                onClick={() => setBookingView(key)}
                onKeyDown={(e) => handleBookingViewKeyDown(e, index)}
                role="tab"
                aria-selected={bookingView === key}
                tabIndex={bookingView === key ? 0 : -1}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.tournamentPill}>
            <span className={styles.pillDot} />
            {tournament.name}
          </div>
        </div>
      </div>

      {justBooked && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={15} />
          Room assigned successfully. Participants notified.
        </div>
      )}

      {bookingView === 'assign' ? (
        <div className={styles.assignSection}>
          {selectedMatchData && (
            <div className={styles.assignBanner}>
              <div>
                <p className={styles.assignBannerLabel}>Selected Match</p>
                <p className={styles.assignBannerTitle}>
                  {getParticipantName(selectedMatchData.participant1Id)} <span>vs</span> {getParticipantName(selectedMatchData.participant2Id)}
                </p>
              </div>
              <button className={styles.assignBannerClear} onClick={() => setSelectedMatch(null)}>
                Clear
              </button>
            </div>
          )}

          <div className={styles.timeBoardList}>
            {timeBlockBoards.map(({ timeBlock, matches }) => {
              const selectableMatches = matches.filter(m => m.status !== 'completed');
              const isExpanded = expandedTimeBlocks.includes(timeBlock.id);
              return (
                <section key={timeBlock.id} className={styles.timeBoard}>
                  <button
                    type="button"
                    className={styles.timeBoardHeader}
                    onClick={() => {
                      setExpandedTimeBlocks(prev =>
                        prev.includes(timeBlock.id)
                          ? prev.filter(id => id !== timeBlock.id)
                          : [...prev, timeBlock.id],
                      );
                    }}
                  >
                    <div>
                      <p className={styles.timeBoardTitle}>{timeBlock.label}</p>
                      <p className={styles.timeBoardMeta}>{formatSlotTime(timeBlock.start, timeBlock.date)}</p>
                    </div>
                    <div className={styles.timeBoardHeaderRight}>
                      <span className={styles.timeBoardCount}>
                        {matches.length} match{matches.length !== 1 ? 'es' : ''}
                      </span>
                      <ChevronDown size={16} className={`${styles.timeBoardChevron} ${isExpanded ? styles.timeBoardChevronOpen : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={styles.timeBoardGrid}>
                      <div className={styles.timeBoardColumn}>
                        <h2 className={styles.panelTitle}>Matches</h2>
                        <div className={styles.matchList}>
                          {matches.length === 0 ? (
                            <div className={styles.summaryEmpty}>No matches in this slot.</div>
                          ) : (
                            matches.map(m => {
                              const loc = tournament.locations.find(l => l.id === m.locationId);
                              const isSelected = selectedMatch === m.id;
                              const isLocked = m.status === 'completed';
                              return (
                                <div
                                  key={m.id}
                                  className={`${styles.matchCard} ${isSelected ? styles.matchSelected : ''} ${isLocked ? styles.matchDone : ''}`}
                                  onClick={() => !isLocked && setSelectedMatch(isSelected ? null : m.id)}
                                  onKeyDown={(e) =>
                                    handleSelectableCardKeyDown(e, () => {
                                      if (isLocked) return;
                                      setSelectedMatch(isSelected ? null : m.id);
                                    })}
                                  tabIndex={isLocked ? -1 : 0}
                                  role="button"
                                >
                                  <div className={styles.matchTop}>
                                    <span className={styles.matchLabel}>Match {m.matchNumber} · Round {m.round}</span>
                                    <span className={styles.matchStatus} data-status={m.status}>{m.status}</span>
                                  </div>
                                  <p className={styles.matchPlayers}>
                                    {getParticipantName(m.participant1Id)} <span>vs</span> {getParticipantName(m.participant2Id)}
                                  </p>
                                  <div className={styles.matchMeta}>
                                    {loc
                                      ? <span className={styles.metaItem} style={{ color: 'var(--accent)' }}><MapPin size={11} />{loc.name}</span>
                                      : <span className={styles.metaItem} style={{ color: 'var(--amber)' }}><AlertTriangle size={11} />No room</span>
                                    }
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className={styles.timeBoardColumn}>
                        <h2 className={styles.panelTitle}>
                          Rooms
                          {selectedMatchData?.timeBlockId === timeBlock.id && <span className={styles.selectHint}>click a room to assign</span>}
                        </h2>
                        <div className={styles.roomGrid}>
                          {tournament.locations.map(loc => {
                            const canAssignInSlot = selectedMatchData?.timeBlockId === timeBlock.id;
                            const conflicts = canAssignInSlot && selectedMatchData ? getConflicts(loc.id, selectedMatchData.id) : [];
                            const hasConflict = conflicts.length > 0;
                            const usedBy = occupancy[loc.id] ?? [];
                            const isSelected = selectedRoom === loc.id;

                            return (
                              <div
                                key={loc.id}
                                className={`${styles.roomCard} ${!loc.available ? styles.roomUnavailable : ''} ${hasConflict ? styles.roomConflict : ''} ${isSelected ? styles.roomSelected : ''} ${!canAssignInSlot ? styles.roomIdle : ''}`}
                                onClick={() => {
                                  if (!selectedMatchData || selectedMatchData.timeBlockId !== timeBlock.id || !loc.available || hasConflict) return;
                                  setSelectedRoom(loc.id);
                                  setConfirmOpen(true);
                                }}
                                onKeyDown={(e) =>
                                  handleSelectableCardKeyDown(e, () => {
                                    if (!selectedMatchData || selectedMatchData.timeBlockId !== timeBlock.id || !loc.available || hasConflict) return;
                                    setSelectedRoom(loc.id);
                                    setConfirmOpen(true);
                                  })}
                                tabIndex={!selectedMatchData || selectedMatchData.timeBlockId !== timeBlock.id || !loc.available || hasConflict ? -1 : 0}
                                role="button"
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
                                      ? <AlertTriangle size={16} style={{ color: 'var(--amber)' }} />
                                      : <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
                                    }
                                  </div>
                                </div>
                                <div className={styles.roomMeta}>
                                  <span className={styles.roomCap}><Users size={12} />Cap. {loc.capacity}</span>
                                  <span className={styles.roomUsage}>{usedBy.length} match{usedBy.length !== 1 ? 'es' : ''} booked</span>
                                </div>
                                {hasConflict && (
                                  <div className={styles.conflictWarning}>
                                    <AlertTriangle size={11} />
                                    Conflict in this slot
                                  </div>
                                )}
                                {!loc.available && (
                                  <div className={styles.conflictWarning} style={{ color: 'var(--red)', background: 'var(--red-dim)' }}>
                                    <XCircle size={11} />
                                    Unavailable
                                  </div>
                                )}
                                <div className={styles.roomStatusLabel} data-available={loc.available && !hasConflict}>
                                  {!canAssignInSlot
                                    ? selectableMatches.length > 0 ? 'Select a match in this slot' : 'No match to assign'
                                    : !loc.available
                                    ? 'Unavailable'
                                    : hasConflict
                                    ? 'Conflict'
                                    : 'Assign room'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.viewerSection}>
          <div className={styles.viewerBlock}>
            <div className={`${styles.summaryHeader} ${styles.summaryHeaderAvailable}`}>
              <h3 className={styles.summaryTitle}>Available Rooms</h3>
              <span className={styles.summaryCount}>
                {unassignedRooms.length} available
              </span>
            </div>
            <div className={`${styles.bookingSummary} ${styles.bookingSummaryAvailable}`}>
            {unassignedRooms.length > 0 ? (
              <div className={styles.summaryMatchesList}>
                {unassignedRooms.map(loc => (
                    <div key={loc.id} className={`${styles.summaryMatchCard} ${styles.summaryMatchCardAvailable}`} data-status={loc.available ? 'scheduled' : 'completed'}>
                      <div className={styles.summaryMatchTop}>
                        <span className={styles.summaryRoom}><MapPin size={12} />{loc.name}</span>
                        <span className={styles.summaryChip} data-status={loc.available ? 'scheduled' : 'completed'}>
                        {loc.available ? 'Open' : 'Unavailable'}
                      </span>
                    </div>
                    <p className={styles.summaryRoomMeta}>{loc.building} · Cap. {loc.capacity}</p>
                    <p className={styles.summaryMatchTime}>
                      {loc.available ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {loc.available ? 'No current assignments' : 'Room currently unavailable'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.summaryEmpty}>All rooms currently have assignments.</div>
            )}
            </div>
          </div>

          <div className={styles.viewerBlock}>
            <div className={`${styles.viewerHeader} ${styles.viewerHeaderBooked}`}>
              <h2 className={styles.panelTitle}>Booked Rooms</h2>
              <span className={styles.viewerMeta}>{assignedMatches.length} active assignments</span>
            </div>
            {tournament.locations.some(loc => tournament.matches.some(m => m.locationId === loc.id)) ? (
              <div className={styles.viewerGrid}>
                {tournament.locations.map(loc => {
                  const booked = tournament.matches.filter(m => m.locationId === loc.id);
                  if (booked.length === 0) return null;
                  return (
                    <div key={loc.id} className={`${styles.viewerCard} ${styles.viewerCardBooked}`}>
                      <div className={styles.summaryRoomRow}>
                        <div>
                          <p className={styles.summaryRoom}><MapPin size={12} />{loc.name}</p>
                          <p className={styles.summaryRoomMeta}>{loc.building} · Cap. {loc.capacity}</p>
                        </div>
                        <span className={styles.summaryRoomCount}>
                          {booked.length} match{booked.length !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      <div className={styles.summaryMatchesList}>
                        {booked.map(m => {
                          const tb = tournament.timeBlocks.find(t => t.id === m.timeBlockId);
                          return (
                            <div key={m.id} className={styles.summaryMatchCard} data-status={m.status}>
                              <div className={styles.summaryMatchTop}>
                                <span className={styles.summaryMatchRef}>Match {m.matchNumber} · Round {m.round}</span>
                                <span className={styles.summaryChip} data-status={m.status}>{m.status}</span>
                              </div>
                              <p className={styles.summaryMatchPlayers}>
                                {getParticipantName(m.participant1Id)} <span>vs</span> {getParticipantName(m.participant2Id)}
                              </p>
                              {tb && (
                                <p className={styles.summaryMatchTime}>
                                  <Clock size={11} />
                                  {tb.label} · {formatSlotTime(tb.start, tb.date)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.summaryEmpty}>No rooms assigned yet.</div>
            )}
          </div>
        </div>
      )}

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
                    <div className={styles.confirmRow}><span>Time</span><strong>{tb ? `${tb.label} · ${formatSlotTime(tb.start, tb.date)}` : '—'}</strong></div>
                    <div className={styles.confirmRow}><span>Room</span><strong>{loc.name}, {loc.building}</strong></div>
                    <div className={styles.confirmRow}><span>Capacity</span><strong>{loc.capacity} people</strong></div>
                  </div>
                  <p className={styles.confirmNote}>All participants will be notified within 30 seconds of this assignment.</p>
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

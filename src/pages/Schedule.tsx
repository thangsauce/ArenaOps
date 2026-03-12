import { useState } from 'react';
import { useApp } from '../store/store';
import { formatTimeRange } from '../utils/time';
import { ChevronLeft, ChevronRight, MapPin, Zap, Clock, AlertTriangle } from 'lucide-react';
import { mockTournaments } from '../data/mockData';
import type { Match, Tournament } from '../types';
import styles from './Schedule.module.css';

interface ScheduledMatch extends Match {
  tournament: Tournament;
}

const statusConfig = {
  completed: { label: 'Done', color: 'var(--text-3)', bg: 'var(--bg-3)', border: 'var(--border)' },
  live:      { label: 'Live', color: 'var(--red)',    bg: 'rgba(255,71,87,0.10)', border: 'rgba(255,71,87,0.45)' },
  scheduled: { label: 'Scheduled', color: 'var(--blue)',  bg: 'rgba(79,172,254,0.10)', border: 'rgba(79,172,254,0.35)' },
  delayed:   { label: 'Delay', color: '#ffaa00',      bg: 'rgba(255,170,0,0.10)', border: 'rgba(255,170,0,0.4)' },
  cancelled: { label: 'Canc', color: 'var(--text-3)', bg: 'var(--bg-3)', border: 'var(--border)' },
};

export default function Schedule() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedDate, setSelectedDate] = useState('2026-03-15');
  const [reportDelayMatch, setReportDelayMatch] = useState<string | null>(null);
  const { timePrefs } = useApp();

  const t = mockTournaments[0];

  const allMatches: ScheduledMatch[] = mockTournaments.flatMap(tour =>
    tour.matches.filter(m => m.timeBlockId).map(m => ({ ...m, tournament: tour }))
  );

  const getName = (tour: Tournament, id: string | null) =>
    id ? (tour.participants.find(p => p.id === id)?.name ?? 'TBD') : 'TBD';

  const liveMatches = allMatches.filter(m => m.status === 'live');
  const delayedMatches = allMatches.filter(m => m.status === 'delayed');

  // For grid: cell lookup by [locationId][timeBlockId]
  const cellMap: Record<string, Record<string, ScheduledMatch[]>> = {};
  allMatches.forEach(m => {
    if (!m.locationId || !m.timeBlockId) return;
    if (!cellMap[m.locationId]) cellMap[m.locationId] = {};
    if (!cellMap[m.locationId][m.timeBlockId]) cellMap[m.locationId][m.timeBlockId] = [];
    cellMap[m.locationId][m.timeBlockId].push(m);
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Schedule</h1>
          <p className={styles.sub}>Match timeline and resource planning</p>
        </div>
        <div className={styles.viewToggle}>
          <button className={`${styles.toggleBtn} ${view === 'grid' ? styles.toggleActive : ''}`} onClick={() => setView('grid')}>Grid</button>
          <button className={`${styles.toggleBtn} ${view === 'list' ? styles.toggleActive : ''}`} onClick={() => setView('list')}>List</button>
        </div>
      </div>

      {(liveMatches.length > 0 || delayedMatches.length > 0) && (
        <div className={styles.alertBar}>
          {liveMatches.length > 0 && (
            <div className={styles.alert} data-type="live">
              <Zap size={14} />
              <strong>{liveMatches.length} live now</strong>
              {liveMatches.map(m => (
                <span key={m.id} className={styles.alertChip}>
                  {getName(m.tournament, m.participant1Id)} vs {getName(m.tournament, m.participant2Id)}
                </span>
              ))}
            </div>
          )}
          {delayedMatches.length > 0 && (
            <div className={styles.alert} data-type="delayed">
              <AlertTriangle size={14} />
              <strong>{delayedMatches.length} delayed</strong>
            </div>
          )}
        </div>
      )}

      <div className={styles.dateNav}>
        <button className={styles.dateBtn} onClick={() => setSelectedDate('2026-03-14')}><ChevronLeft size={16} /></button>
        <div className={styles.dateDisplay}>
          <span className={styles.dateFull}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          {selectedDate === '2026-03-15' && <span className={styles.todayBadge}>Tournament Day</span>}
        </div>
        <button className={styles.dateBtn} onClick={() => setSelectedDate('2026-03-16')}><ChevronRight size={16} /></button>
      </div>

      {view === 'grid' ? (
        <div className={styles.gridWrapper}>
          <table className={styles.grid}>
            <thead>
              <tr>
                <th className={styles.cornerCell}>
                  <span className={styles.cornerLabel}>Location</span>
                </th>
                {t.timeBlocks.map(tb => (
                  <th key={tb.id} className={styles.timeHeader}>
                    <span className={styles.timeHeaderLabel}>{tb.label}</span>
                    <span className={styles.timeHeaderRange}>{formatTimeRange(tb.start, tb.end, tb.date, timePrefs.format, timePrefs.timezone)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.locations.map(loc => (
                <tr key={loc.id} className={!loc.available ? styles.unavailableRow : ''}>
                  <td className={styles.locationCell}>
                    <div className={styles.locationName}>
                      <MapPin size={12} />
                      {loc.name}
                    </div>
                    <div className={styles.locationBuilding}>{loc.building}</div>
                    {!loc.available && <span className={styles.unavailableTag}>Unavailable</span>}
                  </td>
                  {t.timeBlocks.map(tb => {
                    const matches = cellMap[loc.id]?.[tb.id] ?? [];
                    return (
                      <td key={tb.id} className={`${styles.cell} ${!loc.available ? styles.cellUnavailable : ''}`}>
                        {matches.length === 0 ? (
                          <div className={styles.emptyCell}>—</div>
                        ) : (
                          <div className={styles.cellMatches}>
                            {matches.map(m => {
                              const st = statusConfig[m.status];
                              const p1 = getName(m.tournament, m.participant1Id);
                              const p2 = getName(m.tournament, m.participant2Id);
                              return (
                                <div
                                  key={m.id}
                                  className={styles.matchChip}
                                  style={{ color: st.color, background: st.bg, borderColor: st.border }}
                                >
                                  {m.status === 'live' && <span className={styles.chipPulse} />}
                                  <span className={styles.chipRef}>R{m.round}·M{m.matchNumber}</span>
                                  <span className={styles.chipPlayers}>{p1}<span className={styles.chipVs}>vs</span>{p2}</span>
                                  <span className={styles.chipStatus}>{st.label}</span>
                                  {m.status === 'live' && (
                                    <button className={styles.chipDelay} onClick={() => setReportDelayMatch(m.id)}>
                                      <AlertTriangle size={10} />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.listView}>
          {t.timeBlocks.map(tb => {
            const blockMatches = allMatches.filter(m => m.timeBlockId === tb.id);
            if (blockMatches.length === 0) return null;
            return (
              <div key={tb.id} className={styles.timeGroup}>
                <div className={styles.timeGroupHeader}>
                  <Clock size={13} />
                  <span>{tb.label}</span>
                  <span className={styles.timeRange}>{formatTimeRange(tb.start, tb.end, tb.date, timePrefs.format, timePrefs.timezone)}</span>
                  <span className={styles.timeGroupCount}>{blockMatches.length} match{blockMatches.length > 1 ? 'es' : ''}</span>
                </div>
                <div className={styles.matchList}>
                  {blockMatches.map(m => {
                    const loc = t.locations.find(l => l.id === m.locationId);
                    const st = statusConfig[m.status];
                    const p1 = getName(m.tournament, m.participant1Id);
                    const p2 = getName(m.tournament, m.participant2Id);
                    return (
                      <div key={m.id} className={styles.matchRow}>
                        <div className={styles.matchDot} style={{ background: st.color }} />
                        <div className={styles.matchInfo}>
                          <div className={styles.matchPlayers}>
                            <span className={m.winnerId === m.participant1Id && m.winnerId ? styles.winnerName : ''}>{p1}</span>
                            <span className={styles.vsText}>vs</span>
                            <span className={m.winnerId === m.participant2Id && m.winnerId ? styles.winnerName : ''}>{p2}</span>
                          </div>
                          <div className={styles.matchMeta}>
                            <span className={styles.tournamentTag}>{m.tournament.name}</span>
                            {loc && <span className={styles.locationTag}><MapPin size={11} />{loc.name}</span>}
                          </div>
                        </div>
                        {m.status === 'completed' && (
                          <div className={styles.scoreDisplay}>
                            <span>{m.score1}</span>
                            <span className={styles.scoreDash}>—</span>
                            <span>{m.score2}</span>
                          </div>
                        )}
                        <div className={styles.matchStatusChip} style={{ color: st.color, background: st.bg }}>
                          {m.status === 'live' && <span className={styles.livePulse} />}
                          {st.label}
                        </div>
                        {m.status === 'live' && (
                          <button className={styles.delayBtn} onClick={() => setReportDelayMatch(m.id)}>
                            <AlertTriangle size={12} /> Delay
                          </button>
                        )}
                        {m.status === 'scheduled' && (
                          <button className={styles.startBtn}><Zap size={12} /> Start</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {allMatches.filter(m => !m.timeBlockId).length > 0 && (
            <div className={styles.timeGroup}>
              <div className={styles.timeGroupHeader}>
                <Clock size={13} /><span>Unscheduled</span>
                <span className={styles.timeGroupCount}>{allMatches.filter(m => !m.timeBlockId).length} match{allMatches.filter(m => !m.timeBlockId).length > 1 ? 'es' : ''}</span>
              </div>
              <div className={styles.matchList}>
                {allMatches.filter(m => !m.timeBlockId).map(m => {
                  const p1 = getName(m.tournament, m.participant1Id);
                  const p2 = getName(m.tournament, m.participant2Id);
                  return (
                    <div key={m.id} className={styles.matchRow}>
                      <div className={styles.matchDot} style={{ background: 'var(--text-3)' }} />
                      <div className={styles.matchInfo}>
                        <div className={styles.matchPlayers}>
                          <span>{p1}</span><span className={styles.vsText}>vs</span><span>{p2}</span>
                        </div>
                        <div className={styles.matchMeta}><span className={styles.tournamentTag}>{m.tournament.name}</span></div>
                      </div>
                      <span className={styles.unscheduledTag}>Needs scheduling</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {reportDelayMatch && (
        <div className={styles.modalOverlay} onClick={() => setReportDelayMatch(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Report Delay</h2>
            <p className={styles.modalSub}>How long is the expected delay?</p>
            <div className={styles.delayOptions}>
              {['5 min', '10 min', '15 min', '30 min', '1 hour'].map(d => (
                <button key={d} className={styles.delayOption} onClick={() => setReportDelayMatch(null)}>{d}</button>
              ))}
            </div>
            <p className={styles.autoNote}>⚡ ArenaOPS will auto-reschedule downstream matches and notify participants.</p>
            <button className={styles.cancelBtn} onClick={() => setReportDelayMatch(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

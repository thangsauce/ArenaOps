import { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2, Clock, MapPin, UserX, Trophy, Play, SkipForward } from 'lucide-react';
import { useApp } from '../store/AppContext';
import styles from './LiveControl.module.css';

export default function LiveControl() {
  const { tournaments, startMatch, completeMatch, reportNoShow, reportDelay } = useApp();
  const tournament = tournaments[0];

  const [scoreModal, setScoreModal] = useState<{ matchId: string } | null>(null);
  const [noShowModal, setNoShowModal] = useState<{ matchId: string } | null>(null);
  const [delayModal, setDelayModal] = useState<{ matchId: string } | null>(null);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');

  const getP = (id: string | null) => id ? tournament.participants.find(p => p.id === id) : null;
  const getName = (id: string | null) => getP(id)?.name ?? 'TBD';
  const getLoc = (id?: string) => tournament.locations.find(l => l.id === id);
  const getSlot = (id?: string) => tournament.timeBlocks.find(t => t.id === id);

  const live = tournament.matches.filter(m => m.status === 'live');
  const upcoming = tournament.matches.filter(m => m.status === 'scheduled');
  const delayed = tournament.matches.filter(m => m.status === 'delayed');
  const done = tournament.matches.filter(m => m.status === 'completed');

  const handleComplete = () => {
    if (!scoreModal) return;
    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;
    const m = tournament.matches.find(x => x.id === scoreModal.matchId)!;
    const winnerId = s1 > s2 ? m.participant1Id! : m.participant2Id!;
    completeMatch(tournament.id, scoreModal.matchId, winnerId, s1, s2);
    setScoreModal(null);
    setScore1(''); setScore2('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Live Control</h1>
          <p className={styles.sub}>Real-time match management · Updates push to all participants instantly</p>
        </div>
        <div className={styles.liveStatus}>
          <span className={styles.liveDot} />
          {live.length} live · {upcoming.length} queued
        </div>
      </div>

      {/* Live matches */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ color: 'var(--red)' }}>
          <Zap size={13} /> Live Now
        </h2>
        {live.length === 0 && <div className={styles.empty}>No matches live right now.</div>}
        <div className={styles.matchGrid}>
          {live.map(m => {
            const loc = getLoc(m.locationId);
            const slot = getSlot(m.timeBlockId);
            return (
              <div key={m.id} className={styles.liveCard}>
                <div className={styles.liveHeader}>
                  <span className={styles.liveChip}><span className={styles.livePulse} />LIVE</span>
                  <span className={styles.matchRef}>R{m.round} · M{m.matchNumber}</span>
                </div>
                <div className={styles.matchup}>
                  <div className={styles.player}>
                    <span className={styles.playerName}>{getName(m.participant1Id)}</span>
                    <input
                      className={styles.scoreInput}
                      type="number"
                      min="0"
                      defaultValue={m.score1 ?? 0}
                      placeholder="0"
                    />
                  </div>
                  <span className={styles.vs}>VS</span>
                  <div className={styles.player}>
                    <span className={styles.playerName}>{getName(m.participant2Id)}</span>
                    <input
                      className={styles.scoreInput}
                      type="number"
                      min="0"
                      defaultValue={m.score2 ?? 0}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className={styles.matchMeta}>
                  {loc && <span><MapPin size={11} />{loc.name}</span>}
                  {slot && <span><Clock size={11} />{slot.start}</span>}
                </div>
                <div className={styles.matchActions}>
                  <button className={styles.noShowBtn} onClick={() => setNoShowModal({ matchId: m.id })}>
                    <UserX size={13} /> No-show
                  </button>
                  <button className={styles.delayBtn} onClick={() => setDelayModal({ matchId: m.id })}>
                    <Clock size={13} /> Delay
                  </button>
                  <button className={styles.completeBtn} onClick={() => setScoreModal({ matchId: m.id })}>
                    <CheckCircle2 size={13} /> Complete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Delayed */}
      {delayed.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ color: '#ffaa00' }}>
            <AlertTriangle size={13} /> Delayed
          </h2>
          <div className={styles.matchGrid}>
            {delayed.map(m => (
              <div key={m.id} className={styles.delayCard}>
                <div className={styles.delayTop}>
                  <span className={styles.delayChip}>Delayed</span>
                  <span className={styles.matchRef}>R{m.round} · M{m.matchNumber}</span>
                </div>
                <p className={styles.delayPlayers}>{getName(m.participant1Id)} vs {getName(m.participant2Id)}</p>
                <div className={styles.matchActions}>
                  <button className={styles.rescheduleBtn} onClick={() => startMatch(tournament.id, m.id)}>
                    <SkipForward size={13} /> Resume now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming queue */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><Clock size={13} /> Upcoming</h2>
        {upcoming.length === 0 && <div className={styles.empty}>No scheduled matches.</div>}
        <div className={styles.queueList}>
          {upcoming.map(m => {
            const slot = getSlot(m.timeBlockId);
            const loc = getLoc(m.locationId);
            return (
              <div key={m.id} className={styles.queueRow}>
                <div className={styles.queueInfo}>
                  <span className={styles.queueRef}>R{m.round} · M{m.matchNumber}</span>
                  <span className={styles.queuePlayers}>{getName(m.participant1Id)} vs {getName(m.participant2Id)}</span>
                </div>
                <div className={styles.queueMeta}>
                  {slot && <span><Clock size={11} />{slot.label}</span>}
                  {loc ? <span><MapPin size={11} />{loc.name}</span> : <span style={{ color: '#ffaa00' }}><AlertTriangle size={11} />No room</span>}
                </div>
                <button className={styles.startBtn} onClick={() => startMatch(tournament.id, m.id)}>
                  <Play size={12} /> Start
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completed */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><Trophy size={13} /> Completed ({done.length})</h2>
        <div className={styles.doneList}>
          {done.map(m => {
            const w = getName(m.winnerId);
            return (
              <div key={m.id} className={styles.doneRow}>
                <span className={styles.doneRef}>R{m.round} · M{m.matchNumber}</span>
                <span className={styles.donePlayers}>{getName(m.participant1Id)} <span className={styles.scoreSpan}>{m.score1}</span> — <span className={styles.scoreSpan}>{m.score2}</span> {getName(m.participant2Id)}</span>
                <span className={styles.winnerBadge}><Trophy size={11} />{w} wins</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Complete match modal */}
      {scoreModal && (() => {
        const m = tournament.matches.find(x => x.id === scoreModal.matchId)!;
        return (
          <div className={styles.overlay} onClick={() => setScoreModal(null)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Record Result</h2>
              <p className={styles.modalSub}>Enter final scores to complete the match.</p>
              <div className={styles.scoreEntry}>
                <div className={styles.scorePlayer}>
                  <p className={styles.scorePlayerName}>{getName(m.participant1Id)}</p>
                  <input className={styles.scoreBigInput} type="number" min="0" value={score1} onChange={e => setScore1(e.target.value)} placeholder="0" />
                </div>
                <span className={styles.scoreDash}>—</span>
                <div className={styles.scorePlayer}>
                  <p className={styles.scorePlayerName}>{getName(m.participant2Id)}</p>
                  <input className={styles.scoreBigInput} type="number" min="0" value={score2} onChange={e => setScore2(e.target.value)} placeholder="0" />
                </div>
              </div>
              {score1 !== '' && score2 !== '' && (
                <p className={styles.winnerPreview}>
                  Winner: <strong style={{ color: 'var(--accent)' }}>{parseInt(score1) > parseInt(score2) ? getName(m.participant1Id) : getName(m.participant2Id)}</strong>
                </p>
              )}
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setScoreModal(null)}>Cancel</button>
                <button className={styles.confirmBtn} onClick={handleComplete} disabled={score1 === '' || score2 === ''}>
                  <CheckCircle2 size={14} /> Confirm Result
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* No-show modal */}
      {noShowModal && (() => {
        const m = tournament.matches.find(x => x.id === noShowModal.matchId)!;
        return (
          <div className={styles.overlay} onClick={() => setNoShowModal(null)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Report No-Show</h2>
              <p className={styles.modalSub}>Select the player who did not appear.</p>
              <div className={styles.noShowOptions}>
                {[m.participant1Id, m.participant2Id].map(pid => (
                  <button key={pid} className={styles.noShowOption} onClick={() => { reportNoShow(tournament.id, m.id, pid!); setNoShowModal(null); }}>
                    <UserX size={14} /> {getName(pid)}
                  </button>
                ))}
              </div>
              <p className={styles.autoNote}>⚡ ArenaOPS will auto-reschedule and notify all affected participants.</p>
              <button className={styles.cancelBtn} onClick={() => setNoShowModal(null)}>Cancel</button>
            </div>
          </div>
        );
      })()}

      {/* Delay modal */}
      {delayModal && (
        <div className={styles.overlay} onClick={() => setDelayModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Report Delay</h2>
            <p className={styles.modalSub}>How long is the expected delay?</p>
            <div className={styles.delayOptions}>
              {[5, 10, 15, 30, 60].map(mins => (
                <button key={mins} className={styles.delayOption} onClick={() => { reportDelay(tournament.id, delayModal.matchId, mins); setDelayModal(null); }}>
                  {mins < 60 ? `${mins} min` : '1 hour'}
                </button>
              ))}
            </div>
            <p className={styles.autoNote}>⚡ Downstream matches will be automatically adjusted and participants notified.</p>
            <button className={styles.cancelBtn} onClick={() => setDelayModal(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

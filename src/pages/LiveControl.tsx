import { useState, useEffect, useRef, useMemo } from 'react';
import { Zap, AlertTriangle, CheckCircle2, Clock, MapPin, UserX, Trophy, Play, X, SkipForward } from 'lucide-react';
import { useApp } from '../store/store';
import { useFocusTrap } from '../hooks/useFocusTrap';
import styles from './LiveControl.module.css';

type ModalState =
  | { type: 'score';  matchId: string }
  | { type: 'noShow'; matchId: string }
  | { type: 'delay';  matchId: string }
  | null;

export default function LiveControl() {
  const { tournaments, startMatch, completeMatch, reportNoShow, reportDelay } = useApp();
  const tournament = tournaments[0];

  const [modal, setModal] = useState<ModalState>(null);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, modal !== null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeModal = () => { setModal(null); setScore1(''); setScore2(''); };

  const getP    = (id: string | null) => id ? tournament.participants.find(p => p.id === id) : null;
  const getName = (id: string | null) => getP(id)?.name ?? 'TBD';
  const getLoc  = (id?: string) => tournament.locations.find(l => l.id === id);
  const getSlot = (id?: string) => tournament.timeBlocks.find(t => t.id === id);

  const { live, upcoming, delayed, done } = useMemo(() => ({
    live:     tournament?.matches.filter(m => m.status === 'live')      ?? [],
    upcoming: tournament?.matches.filter(m => m.status === 'scheduled') ?? [],
    delayed:  tournament?.matches.filter(m => m.status === 'delayed')   ?? [],
    done:     tournament?.matches.filter(m => m.status === 'completed') ?? [],
  }), [tournament]);

  if (!tournament) return <div className={styles.page}><p style={{ padding: '2rem' }}>No tournaments available.</p></div>;

  const handleComplete = () => {
    if (!modal || modal.type !== 'score') return;
    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;
    if (s1 === s2) return;
    const m = tournament.matches.find(x => x.id === modal.matchId)!;
    const winnerId = s1 > s2 ? m.participant1Id : m.participant2Id;
    if (!winnerId) return;
    completeMatch(tournament.id, modal.matchId, winnerId, s1, s2);
    closeModal();
  };

  const scoreMatch  = modal?.type === 'score'  ? tournament.matches.find(x => x.id === modal.matchId) : null;
  const noShowMatch = modal?.type === 'noShow' ? tournament.matches.find(x => x.id === modal.matchId) : null;

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
                    <label className={styles.playerName} htmlFor={`score-${m.id}-1`}>{getName(m.participant1Id)}</label>
                    <input
                      id={`score-${m.id}-1`}
                      className={styles.scoreInput}
                      type="number"
                      min="0"
                      defaultValue={m.score1 ?? 0}
                      placeholder="0"
                      aria-label={`Score for ${getName(m.participant1Id)}`}
                    />
                  </div>
                  <span className={styles.vs} aria-hidden="true">VS</span>
                  <div className={styles.player}>
                    <label className={styles.playerName} htmlFor={`score-${m.id}-2`}>{getName(m.participant2Id)}</label>
                    <input
                      id={`score-${m.id}-2`}
                      className={styles.scoreInput}
                      type="number"
                      min="0"
                      defaultValue={m.score2 ?? 0}
                      placeholder="0"
                      aria-label={`Score for ${getName(m.participant2Id)}`}
                    />
                  </div>
                </div>
                <div className={styles.matchMeta}>
                  {loc && <span><MapPin size={11} />{loc.name}</span>}
                  {slot && <span><Clock size={11} />{slot.start}</span>}
                </div>
                <div className={styles.matchActions}>
                  <button className={styles.noShowBtn} onClick={() => setModal({ type: 'noShow', matchId: m.id })}>
                    <UserX size={13} aria-hidden="true" /> No-show
                  </button>
                  <button className={styles.delayBtn} onClick={() => setModal({ type: 'delay', matchId: m.id })}>
                    <Clock size={13} aria-hidden="true" /> Delay
                  </button>
                  <button className={styles.completeBtn} onClick={() => setModal({ type: 'score', matchId: m.id })}>
                    <CheckCircle2 size={13} aria-hidden="true" /> Complete
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
      {modal?.type === 'score' && scoreMatch && (
        <div className={styles.overlay} onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="score-modal-title">
          <div className={styles.modal} ref={modalRef} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 id="score-modal-title" className={styles.modalTitle}>Record Result</h2>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Close dialog"><X size={18} /></button>
            </div>
            <p className={styles.modalSub}>Enter final scores to complete the match.</p>
            <div className={styles.scoreEntry}>
              <div className={styles.scorePlayer}>
                <p className={styles.scorePlayerName}>{getName(scoreMatch.participant1Id)}</p>
                <input className={styles.scoreBigInput} type="number" min="0" value={score1} onChange={e => setScore1(e.target.value)} placeholder="0" aria-label={`Score for ${getName(scoreMatch.participant1Id)}`} />
              </div>
              <span className={styles.scoreDash} aria-hidden="true">—</span>
              <div className={styles.scorePlayer}>
                <p className={styles.scorePlayerName}>{getName(scoreMatch.participant2Id)}</p>
                <input className={styles.scoreBigInput} type="number" min="0" value={score2} onChange={e => setScore2(e.target.value)} placeholder="0" aria-label={`Score for ${getName(scoreMatch.participant2Id)}`} />
              </div>
            </div>
            {score1 !== '' && score2 !== '' && (() => {
              const s1 = parseInt(score1), s2 = parseInt(score2);
              return s1 === s2
                ? <p className={styles.winnerPreview} style={{ color: '#ffaa00' }}>Tie — adjust scores to determine a winner</p>
                : <p className={styles.winnerPreview}>Winner: <strong style={{ color: 'var(--accent)' }}>{s1 > s2 ? getName(scoreMatch.participant1Id) : getName(scoreMatch.participant2Id)}</strong></p>;
            })()}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button className={styles.confirmBtn} onClick={handleComplete} disabled={score1 === '' || score2 === '' || parseInt(score1) === parseInt(score2)}>
                <CheckCircle2 size={14} aria-hidden="true" /> Confirm Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No-show modal */}
      {modal?.type === 'noShow' && noShowMatch && (
        <div className={styles.overlay} onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="noshow-modal-title">
          <div className={styles.modal} ref={modalRef} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 id="noshow-modal-title" className={styles.modalTitle}>Report No-Show</h2>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Close dialog"><X size={18} /></button>
            </div>
            <p className={styles.modalSub}>Select the player who did not appear.</p>
            <div className={styles.noShowOptions}>
              {([noShowMatch.participant1Id, noShowMatch.participant2Id].filter((pid): pid is string => pid !== null)).map(pid => (
                <button key={pid} className={styles.noShowOption} onClick={() => { reportNoShow(tournament.id, noShowMatch.id, pid); closeModal(); }}>
                  <UserX size={14} aria-hidden="true" /> {getName(pid)}
                </button>
              ))}
            </div>
            <p className={styles.autoNote}>⚡ ArenaOPS will auto-reschedule and notify all affected participants.</p>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delay modal */}
      {modal?.type === 'delay' && (
        <div className={styles.overlay} onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="delay-modal-title">
          <div className={styles.modal} ref={modalRef} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 id="delay-modal-title" className={styles.modalTitle}>Report Delay</h2>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Close dialog"><X size={18} /></button>
            </div>
            <p className={styles.modalSub}>How long is the expected delay?</p>
            <div className={styles.delayOptions}>
              {[5, 10, 15, 30, 60].map(mins => (
                <button key={mins} className={styles.delayOption} onClick={() => { reportDelay(tournament.id, modal.matchId, mins); closeModal(); }}>
                  {mins < 60 ? `${mins} min` : '1 hour'}
                </button>
              ))}
            </div>
            <p className={styles.autoNote}>⚡ Downstream matches will be automatically adjusted and participants notified.</p>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

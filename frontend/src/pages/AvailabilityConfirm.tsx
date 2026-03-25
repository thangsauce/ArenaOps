import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Clock, MapPin, Zap } from 'lucide-react';
import { useApp } from '../store/store';
import { formatDate, formatTimeRange } from '../utils/time';
import styles from './AvailabilityConfirm.module.css';

type Step = 'intro' | 'availability' | 'confirm' | 'done';

export default function AvailabilityConfirm() {
  const { token } = useParams<{ token: string }>();
  const { tournaments, timePrefs } = useApp();
  const [step, setStep] = useState<Step>('intro');
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedSlots, setExpandedSlots] = useState<string[]>([]);

  const tournament = tournaments[0];
  // Find participant by token (participant id) or fall back to first pending
  const participant = tournament?.participants.find(p => p.id === token)
    ?? tournament?.participants.find(p => p.status === 'pending');

  const toggleSlot = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleExpandedSlot = (id: string) => {
    setExpandedSlots(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const formatSlotRange = (start: string, end: string, date: string) =>
    formatTimeRange(start, end, date, timePrefs.format, timePrefs.timezone);

  if (!tournament || !participant) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <Zap size={18} className={styles.brandIcon} />
            <span className={styles.brandName}>ArenaOPS</span>
          </div>
          <div className={styles.content}>
            <p>This invitation link is invalid or has expired.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand header */}
        <div className={styles.brand}>
          <Zap size={18} className={styles.brandIcon} />
          <span className={styles.brandName}>ArenaOPS</span>
        </div>

        {step === 'intro' && (
          <div className={styles.content}>
            <div className={styles.tournamentBadge}>{tournament.game}</div>
            <h1 className={styles.tournamentName}>{tournament.name}</h1>
            <p className={styles.greeting}>Hey <strong>{participant.name}</strong> 👋</p>
            <p className={styles.message}>
              You've been invited to participate in <strong>{tournament.name}</strong> organized by {tournament.organizerName}.
              Please confirm your availability so we can schedule your matches.
            </p>

            <div className={styles.infoRow}>
              <div className={styles.infoItem}><Clock size={13} />{formatDate(tournament.startDate)}</div>
              <div className={styles.infoItem}><MapPin size={13} />{tournament.locations[0]?.building}</div>
            </div>

            <div className={styles.actions}>
              <button className={styles.declineBtn} onClick={() => setStep('done')}>
                Can't participate
              </button>
              <button className={styles.primaryBtn} onClick={() => setStep('availability')}>
                I'm in! Pick my times →
              </button>
            </div>
          </div>
        )}

        {step === 'availability' && (
          <div className={styles.content}>
            <h2 className={styles.stepTitle}>Select your availability</h2>
            <p className={styles.stepSub}>Choose all time blocks you're available for. We'll do our best to schedule your matches during these times.</p>

            <div className={styles.slotGrid}>
              {tournament.timeBlocks.map(tb => {
                const isSelected = selected.includes(tb.id);
                const isExpanded = expandedSlots.includes(tb.id);
                return (
                  <div
                    key={tb.id}
                    className={`${styles.slotCard} ${isSelected ? styles.slotSelected : ''} ${isExpanded ? styles.slotExpanded : ''}`}
                  >
                    <button
                      type="button"
                      className={styles.slotToggle}
                      onClick={() => toggleExpandedSlot(tb.id)}
                    >
                      <div className={styles.slotToggleMain}>
                        <div className={styles.slotCheck}>
                          {isSelected ? <CheckCircle2 size={16} /> : <div className={styles.slotCircle} />}
                        </div>
                        <div className={styles.slotInfo}>
                          <span className={styles.slotLabel}>{tb.label}</span>
                          <span className={styles.slotSummary}>{isSelected ? 'Selected' : 'Tap to view details'}</span>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`${styles.slotChevron} ${isExpanded ? styles.slotChevronOpen : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className={styles.slotDetails}>
                        <span className={styles.slotTime}>{formatSlotRange(tb.start, tb.end, tb.date)}</span>
                        <span className={styles.slotDate}>{formatDate(tb.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <button
                          type="button"
                          className={`${styles.slotSelectBtn} ${isSelected ? styles.slotSelectBtnActive : ''}`}
                          onClick={() => toggleSlot(tb.id)}
                        >
                          {isSelected ? 'Selected' : 'Select this slot'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.actions}>
              <button className={styles.backBtn} onClick={() => setStep('intro')}>← Back</button>
              <button
                className={styles.primaryBtn}
                disabled={selected.length === 0}
                onClick={() => setStep('confirm')}
              >
                Continue ({selected.length} selected)
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className={styles.content}>
            <h2 className={styles.stepTitle}>Confirm your entry</h2>
            <p className={styles.stepSub}>Review your availability before submitting.</p>

            <div className={styles.confirmCard}>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Name</span>
                <span className={styles.confirmValue}>{participant.name}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Tournament</span>
                <span className={styles.confirmValue}>{tournament.name}</span>
              </div>
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Available slots</span>
                <div className={styles.confirmSlots}>
                  {selected.map(id => {
                    const tb = tournament.timeBlocks.find(t => t.id === id);
                    return tb ? (
                      <span key={id} className={styles.confirmSlotBadge}>
                        {tb.label} · {formatSlotRange(tb.start, tb.end, tb.date)}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <p className={styles.noteText}>
              By confirming, you agree to attend during your selected times. The organizer will notify you of your scheduled matches.
            </p>

            <div className={styles.actions}>
              <button className={styles.backBtn} onClick={() => setStep('availability')}>← Edit</button>
              <button className={styles.confirmBtn} onClick={() => setStep('done')}>
                ✓ Confirm My Spot
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className={styles.doneContent}>
            <div className={styles.doneIcon}>🎮</div>
            <h2 className={styles.doneTitle}>You're confirmed!</h2>
            <p className={styles.doneMessage}>
              {selected.length > 0
                ? `Thanks ${participant.name.split(' ')[0]}! Your availability has been recorded. ${tournament.organizerName} will send you your match schedule soon.`
                : `We've recorded that you can't participate this time. Hope to see you at the next one!`}
            </p>
            {selected.length > 0 && (
              <div className={styles.doneSlots}>
                {selected.map(id => {
                  const tb = tournament.timeBlocks.find(t => t.id === id);
                  return tb ? (
                    <span key={id} className={styles.doneSlotBadge}><CheckCircle2 size={12} />{tb.label}</span>
                  ) : null;
                })}
              </div>
            )}
            <p className={styles.donePowered}>Powered by <strong>ArenaOPS</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

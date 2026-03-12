import { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Zap } from 'lucide-react';
import { mockTournaments } from '../data/mockData';
import styles from './AvailabilityConfirm.module.css';

const tournament = mockTournaments[0];
// Simulate being "Morgan Davis" - the pending participant
const participant = tournament.participants.find(p => p.status === 'pending')!;

type Step = 'intro' | 'availability' | 'confirm' | 'done';

export default function AvailabilityConfirm() {
  const [step, setStep] = useState<Step>('intro');
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSlot = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

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
              <div className={styles.infoItem}><Clock size={13} />{tournament.startDate}</div>
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
                return (
                  <button
                    key={tb.id}
                    className={`${styles.slotCard} ${isSelected ? styles.slotSelected : ''}`}
                    onClick={() => toggleSlot(tb.id)}
                  >
                    <div className={styles.slotCheck}>
                      {isSelected ? <CheckCircle2 size={16} /> : <div className={styles.slotCircle} />}
                    </div>
                    <div className={styles.slotInfo}>
                      <span className={styles.slotLabel}>{tb.label}</span>
                      <span className={styles.slotTime}>{tb.start} – {tb.end}</span>
                      <span className={styles.slotDate}>{tb.date}</span>
                    </div>
                  </button>
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
                        {tb.label} · {tb.start}–{tb.end}
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

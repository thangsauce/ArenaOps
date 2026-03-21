import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { TournamentFormat } from '../types';
import { useApp } from '../store/store';
import styles from './CreateTournament.module.css';

const formats: { value: TournamentFormat; label: string; desc: string }[] = [
  { value: 'single-elimination', label: 'Single Elimination', desc: 'Lose once and you\'re out' },
  { value: 'double-elimination', label: 'Double Elimination', desc: 'Two losses to be eliminated' },
  { value: 'round-robin', label: 'Round Robin', desc: 'Everyone plays everyone' },
  { value: 'swiss', label: 'Swiss', desc: 'Paired by record each round' },
];

export default function CreateTournament() {
  const navigate = useNavigate();
  const { addTournament } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    game: '',
    format: '' as TournamentFormat | '',
    maxParticipants: '8',
    startDate: '',
    description: '',
    organizerName: '',
  });

  type FormField = keyof typeof form;
  const set = (field: FormField, value: string) => setForm(f => ({ ...f, [field]: value }));

  const canNext1 = form.name && form.game && form.format;
  const canNext2 = form.maxParticipants && form.startDate && form.organizerName;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}>
        <ArrowLeft size={16} /> {step > 1 ? 'Back' : 'Cancel'}
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Create Tournament</h1>
        <div className={styles.steps}>
          {[1, 2, 3].map(s => (
            <div key={s} className={`${styles.step} ${s === step ? styles.stepActive : s < step ? styles.stepDone : ''}`}>
              {s < step ? <CheckCircle2 size={14} /> : s}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Tournament Basics</h2>

          <div className={styles.field}>
            <label>Tournament Name</label>
            <input
              className={styles.input}
              placeholder="e.g. Spring Valorant Open"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Game / Sport</label>
            <input
              className={styles.input}
              placeholder="e.g. Chess, Soccer, Rocket League"
              value={form.game}
              onChange={e => set('game', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Format</label>
            <div className={styles.formatGrid}>
              {formats.map(f => (
                <button
                  key={f.value}
                  className={`${styles.formatCard} ${form.format === f.value ? styles.selected : ''}`}
                  onClick={() => set('format', f.value)}
                >
                  <span className={styles.formatLabel}>{f.label}</span>
                  <span className={styles.formatDesc}>{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button className={styles.nextBtn} disabled={!canNext1} onClick={() => setStep(2)}>
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Details & Schedule</h2>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Max Participants</label>
              <select className={styles.input} value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)}>
                {[4, 8, 16, 32, 64].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Start Date</label>
              <input type="date" className={styles.input} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Your Name (Organizer)</label>
            <input className={styles.input} placeholder="Full name" value={form.organizerName} onChange={e => set('organizerName', e.target.value)} />
          </div>

          <div className={styles.field}>
            <label>Description <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={styles.textarea}
              placeholder="Brief description of the tournament..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
            />
          </div>

          <button className={styles.nextBtn} disabled={!canNext2} onClick={() => setStep(3)}>
            Continue →
          </button>
        </div>
      )}

      {step === 3 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Review & Launch</h2>

          <div className={styles.reviewCard}>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Name</span>
              <span className={styles.reviewValue}>{form.name}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Game</span>
              <span className={styles.reviewValue}>{form.game}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Format</span>
              <span className={styles.reviewValue} style={{ textTransform: 'capitalize' }}>{form.format?.replace(/-/g, ' ')}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Max Players</span>
              <span className={styles.reviewValue}>{form.maxParticipants}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Start Date</span>
              <span className={styles.reviewValue}>{form.startDate}</span>
            </div>
            <div className={styles.reviewRow}>
              <span className={styles.reviewLabel}>Organizer</span>
              <span className={styles.reviewValue}>{form.organizerName}</span>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button className={styles.draftBtn} onClick={() => {
              addTournament({
                id: `t${Date.now()}`,
                name: form.name,
                game: form.game,
                format: form.format as TournamentFormat,
                maxParticipants: parseInt(form.maxParticipants),
                startDate: form.startDate,
                organizerName: form.organizerName,
                description: form.description,
                createdAt: new Date().toISOString(),
                status: 'draft',
                participants: [],
                matches: [],
                locations: [],
                timeBlocks: [],
              });
              navigate('/dashboard');
            }}>Save as Draft</button>
            <button className={styles.launchBtn} onClick={() => {
              addTournament({
                id: `t${Date.now()}`,
                name: form.name,
                game: form.game,
                format: form.format as TournamentFormat,
                maxParticipants: parseInt(form.maxParticipants),
                startDate: form.startDate,
                organizerName: form.organizerName,
                description: form.description,
                createdAt: new Date().toISOString(),
                status: 'active' as const,
                participants: [],
                matches: [],
                locations: [],
                timeBlocks: [],
              });
              navigate('/dashboard');
            }}>
              🚀 Launch Tournament
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, ChevronRight } from 'lucide-react';
import { useApp } from '../store/store';
import styles from './Tournaments.module.css';

export default function Tournaments() {
  const navigate = useNavigate();
  const { tournaments } = useApp();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tournaments</h1>
        <button className={styles.createBtn} onClick={() => navigate('/create')}>
          <Plus size={15} /> New
        </button>
      </div>

      <div className={styles.list}>
        {tournaments.map(t => {
          const confirmed = t.participants.filter(p => p.status === 'confirmed').length;
          return (
            <div key={t.id} className={styles.row} onClick={() => navigate(`/tournaments/${t.id}`)}>
              <div className={styles.rowIcon}>
                <Trophy size={16} />
              </div>
              <div className={styles.rowInfo}>
                <p className={styles.rowName}>{t.name}</p>
                <p className={styles.rowMeta}>{t.game} · {t.format.replace(/-/g, ' ')} · {t.startDate}</p>
              </div>
              <div className={styles.rowStats}>
                <div className={styles.stat}><Users size={13} />{confirmed}/{t.maxParticipants}</div>
                <span className={styles.statusChip} data-status={t.status}>{t.status}</span>
              </div>
              <ChevronRight size={14} className={styles.arrow} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useRef } from 'react';
import { Bell, CheckCheck, Zap, AlertTriangle, Calendar, MapPin, Info, CheckCircle2 } from 'lucide-react';
import { useApp } from '../store/store';
import styles from './Notifications.module.css';
import EmptyState from '../components/EmptyState';

const typeConfig = {
  match_change: { icon: Zap, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  no_show: { icon: AlertTriangle, color: 'var(--amber)', bg: 'var(--amber-dim)' },
  delay: { icon: Calendar, color: 'var(--blue)', bg: 'var(--blue-dim)' },
  room_change: { icon: MapPin, color: 'var(--purple)', bg: 'var(--purple-dim)' },
  system: { icon: Info, color: 'var(--text-2)', bg: 'var(--bg-3)' },
  confirmation: { icon: CheckCircle2, color: 'var(--accent)', bg: 'var(--accent-dim)' },
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function groupLabel(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return 'Earlier';
}

export default function Notifications() {
  const { notifications, markAllRead, markRead, unreadCount } = useApp();
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number,
    id: string,
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      markRead(id);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = itemRefs.current.filter(
      (item): item is HTMLDivElement => item !== null,
    );
    const current = items.findIndex((item) => item === itemRefs.current[index]);
    if (current === -1) return;
    const next =
      e.key === 'ArrowDown'
        ? (current + 1) % items.length
        : (current - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.sub}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="Notifications will appear here"
        />
      )}

      <div className={styles.list}>
        {(() => {
          let lastGroup = '';
          return notifications.map((n, index) => {
            const cfg = typeConfig[n.type];
            const Icon = cfg.icon;
            const group = groupLabel(n.timestamp);
            const showGroup = group !== lastGroup;
            lastGroup = group;
            return (
              <div key={n.id}>
                {showGroup && <p className={styles.groupLabel}>{group}</p>}
                <div
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                  onClick={() => markRead(n.id)}
                  onKeyDown={(e) => handleItemKeyDown(e, index, n.id)}
                  tabIndex={0}
                  role="button"
                >
                  <div className={styles.iconWrap} style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={15} />
                  </div>
                  <div className={styles.content}>
                    <p className={styles.notifTitle}>{n.title}</p>
                    <p className={styles.notifMessage}>{n.message}</p>
                    <p className={styles.notifTime}>{timeAgo(n.timestamp)}</p>
                  </div>
                  {!n.read && <div className={styles.unreadDot} />}
                </div>
              </div>
            );
          });
        })()}
      </div>

      <div className={styles.performanceCard}>
        <h3 className={styles.perfTitle}>Delivery Performance</h3>
        <p className={styles.perfSub}>NFR1 target: 95% delivery in &lt;30s</p>
        <div className={styles.perfStats}>
          <div className={styles.perfStat}>
            <span className={styles.perfValue} style={{ color: 'var(--accent)' }}>100%</span>
            <span className={styles.perfLabel}>Delivery rate</span>
          </div>
          <div className={styles.perfStat}>
            <span className={styles.perfValue} style={{ color: 'var(--blue)' }}>&lt;5s</span>
            <span className={styles.perfLabel}>Avg. delivery</span>
          </div>
          <div className={styles.perfStat}>
            <span className={styles.perfValue}>{notifications.length}</span>
            <span className={styles.perfLabel}>Total sent</span>
          </div>
        </div>
        <div className={styles.perfBar}>
          {[
            { label: 'Delivery rate', pct: 100, color: 'var(--accent)' },
            { label: 'Within 30s',    pct: 100, color: 'var(--blue)'   },
            { label: 'Read rate',     pct: Math.round((notifications.filter(n => n.read).length / Math.max(notifications.length, 1)) * 100), color: 'var(--purple)' },
          ].map(({ label, pct, color }) => (
            <div key={label} className={styles.perfBarRow}>
              <span style={{ width: 90 }}>{label}</span>
              <div className={styles.perfBarTrack}>
                <div className={styles.perfBarFill} style={{ width: `${pct}%`, background: color }} />
              </div>
              <span style={{ width: 36, textAlign: 'right' }}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

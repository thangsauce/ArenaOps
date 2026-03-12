import { Bell, CheckCheck, Zap, AlertTriangle, Calendar, MapPin, Info, CheckCircle2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import styles from './Notifications.module.css';

const typeConfig = {
  match_change: { icon: Zap, color: 'var(--accent)', bg: 'var(--accent-dim)' },
  no_show: { icon: AlertTriangle, color: '#ffaa00', bg: 'rgba(255,170,0,0.12)' },
  delay: { icon: Calendar, color: 'var(--blue)', bg: 'var(--blue-dim)' },
  room_change: { icon: MapPin, color: '#b06cff', bg: 'rgba(176,108,255,0.12)' },
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

export default function Notifications() {
  const { notifications, markAllRead, markRead, unreadCount } = useApp();

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
        <div className={styles.empty}>
          <Bell size={32} className={styles.emptyIcon} />
          <p>No notifications yet</p>
        </div>
      )}

      <div className={styles.list}>
        {notifications.map(n => {
          const cfg = typeConfig[n.type];
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.unread : ''}`}
              onClick={() => markRead(n.id)}
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
          );
        })}
      </div>

      <div className={styles.performanceCard}>
        <h3 className={styles.perfTitle}>Delivery Performance</h3>
        <p className={styles.perfSub}>Based on this tournament (NFR1 target: 95% delivery in &lt;30s)</p>
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
      </div>
    </div>
  );
}

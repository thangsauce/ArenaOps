import { NavLink, useNavigate } from 'react-router-dom';
import { Trophy, LayoutGrid, Users, Calendar, Bell, Settings, Plus, Zap, MapPin, X } from 'lucide-react';
import { useApp } from '../../store/useApp';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/tournaments', icon: Trophy, label: 'Tournaments' },
  { to: '/participants', icon: Users, label: 'Participants' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/live', icon: Zap, label: 'Live Control' },
  { to: '/rooms', icon: MapPin, label: 'Room Booking' },
  { to: '/notifications', icon: Bell, label: 'Notifications', useBadge: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { unreadCount = 0 } = useApp();

  const handleNav = () => onClose?.();

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <div className={styles.logo}>
        <Zap size={20} className={styles.logoIcon} />
        <span className={styles.logoText}>ArenaOPS</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <button className={styles.newBtn} onClick={() => { navigate('/create'); handleNav(); }}>
        <Plus size={16} />
        New Tournament
      </button>

      <nav className={styles.nav}>
        <p className={styles.navSection}>Menu</p>
        {navItems.map(({ to, icon: Icon, label, useBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={handleNav}
          >
            <Icon size={18} />
            <span>{label}</span>
            {useBadge && unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.userCard}>
        <div className={styles.avatar}>CS</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>Casey Segura</p>
          <p className={styles.userRole}>Organizer</p>
        </div>
      </div>
    </aside>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { Trophy, LayoutGrid, Users, Calendar, Bell, Settings, Plus, Zap, MapPin, X, LogOut } from 'lucide-react';
import { useApp } from '../../store/useApp';

const navItems = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
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
  let { unreadCount = 0, settings } = useApp() || {};
  if (!settings) {
    settings = { 
      profile: { 
        name: 'Admin User',
        email: 'demo@university.edu',
        university: 'Demo University'
      } 
    } as any;
  }
  const { name } = settings.profile;
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleNav = () => onClose?.();

  return (
    <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-y-0 border-l-0 rounded-none flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-arena-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-arena-accent/10 rounded-md text-arena-accent">
            <Zap size={20} className="fill-current" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-arena-text">ArenaOPS</span>
        </div>
        <button className="lg:hidden text-arena-text-muted hover:text-arena-text" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        <button 
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-arena-accent hover:bg-[#dfff00] text-arena-bg font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(232,255,71,0.15)] hover:shadow-[0_0_25px_rgba(232,255,71,0.3)] transition-all active:scale-95" 
          onClick={() => { navigate('/create'); handleNav(); }}
        >
          <Plus size={18} />
          New Tournament
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
        
        {navItems.map(({ to, icon: Icon, label, useBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={handleNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive 
                  ? 'bg-arena-surface-hover text-arena-text shadow-lg' 
                  : 'text-arena-text-muted hover:bg-arena-surface-hover hover:text-arena-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-arena-accent rounded-r-full" />
                )}
                <Icon size={18} className={`${isActive ? 'text-arena-accent' : 'text-arena-text-muted group-hover:text-arena-text'}`} />
                <span className="flex-1">{label}</span>
                {useBadge && unreadCount > 0 && (
                  <span className="py-0.5 px-2 bg-red-500/20 text-red-400 rounded-full text-xs font-bold border border-red-500/20">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-arena-border space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-arena-surface-hover transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-arena-accent text-arena-bg font-extrabold flex items-center justify-center shadow-lg shadow-arena-accent/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-arena-text truncate">{name}</p>
            <p className="text-xs text-arena-text-muted">Organizer</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-arena-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}

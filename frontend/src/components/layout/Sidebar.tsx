import { NavLink, useNavigate } from "react-router-dom";
import {
  Trophy,
  LayoutGrid,
  Users,
  Calendar,
  Bell,
  Settings,
  Plus,
  Radio,
  MapPin,
  X,
  LogOut,
  Search,
} from "lucide-react";
import { useApp } from "../../store/useApp";
import type { AppSettings } from "../../store/settings";
import { useState, useRef, useEffect } from "react";
import { buildAppSearchResults } from "../../utils/appSearch";

const navItems = [
  { to: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { to: "/tournaments", icon: Trophy, label: "Tournaments" },
  { to: "/participants", icon: Users, label: "Participants" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
  { to: "/live", icon: Radio, label: "Live Control" },
  { to: "/rooms", icon: MapPin, label: "Room Booking" },
  { to: "/notifications", icon: Bell, label: "Notifications", useBadge: true },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const fallbackSettings: AppSettings = {
  profile: {
    name: "Admin User",
    email: "demo@arenaops.gg",
    university: "ArenaOPS",
  },
  appearance: {
    theme: "dark",
    density: "comfortable",
    mobileMenuPosition: "left",
  },
  timePrefs: {
    format: "12h",
    timezone: "America/New_York",
  },
  notifications: {
    sound: true,
    matchStart: true,
    delays: true,
    noShows: true,
    roomChanges: true,
  },
  schedulePrefs: {
    defaultView: "grid",
    weekStart: "monday",
  },
  participantPrefs: {
    sortBy: "seed",
    hideDeclined: false,
  },
  bracketPrefs: {
    defaultView: "tree",
  },
  tournamentDefaults: {
    format: "single-elimination",
    maxParticipants: "8",
    organizerName: "Admin User",
  },
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const app = useApp();
  const unreadCount = app?.unreadCount ?? 0;
  const settings = app?.settings ?? fallbackSettings;
  const { name } = settings.profile;
  const timePrefs = settings.timePrefs ?? {
    format: "12h",
    timezone: "America/New_York",
  };
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleNav = () => onClose?.();

  const [showResults, setShowResults] = useState(false);
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuItemRefs = useRef<Array<HTMLButtonElement | HTMLAnchorElement | null>>([]);
  const { tournaments, notifications, appSearchQuery, setAppSearchQuery } =
    useApp() || {
      tournaments: [],
      notifications: [],
      appSearchQuery: "",
      setAppSearchQuery: () => {},
    };
  const hasLiveMatches = tournaments.some((tournament) =>
    tournament.matches.some((match) => match.status === "live"),
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = buildAppSearchResults({
    query: appSearchQuery,
    tournaments,
    notifications,
    timePrefs,
  });
  const effectiveFocusedResultIndex =
    !showResults || results.length === 0
      ? -1
      : focusedResultIndex < 0
        ? 0
        : Math.min(focusedResultIndex, results.length - 1);

  useEffect(() => {
    if (!open) return;
    const isMobileView = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobileView) return;
    window.setTimeout(() => {
      menuItemRefs.current[0]?.focus();
    }, 0);
  }, [open]);

  const handleSelectResult = (path: string) => {
    navigate(path);
    setAppSearchQuery("");
    setShowResults(false);
    setFocusedResultIndex(-1);
    handleNav();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedResultIndex((i) =>
        Math.min(i < 0 ? 0 : i + 1, results.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedResultIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
    } else if (e.key === "Enter") {
      if (effectiveFocusedResultIndex < 0) return;
      e.preventDefault();
      handleSelectResult(results[effectiveFocusedResultIndex].path);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowResults(false);
      setFocusedResultIndex(-1);
    }
  };

  const handleMenuItemKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>,
    index: number,
  ) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = menuItemRefs.current.filter(
      (item): item is HTMLButtonElement | HTMLAnchorElement => item !== null,
    );
    if (items.length === 0) return;
    const currentIndex = items.findIndex((item) => item === menuItemRefs.current[index]);
    if (currentIndex === -1) return;
    const nextIndex =
      e.key === "ArrowDown"
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  const isRight = settings.appearance?.mobileMenuPosition !== "left";

  return (
    <aside
      className={`fixed top-0 bottom-0 ${isRight ? "right-0 border-l lg:left-0 lg:border-l-0 lg:border-r" : "left-0 border-r"} z-50 w-64 bg-arena-surface lg:bg-arena-surface/80 backdrop-blur-xl border-arena-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? "translate-x-0" : isRight ? "translate-x-full" : "-translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-arena-border/50">
        <div className="flex items-center gap-2">
          <div className="shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="var(--accent)" fillOpacity="0.12"/>
              <line x1="3"  y1="13" x2="9"  y2="13" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              <line x1="3"  y1="16" x2="11" y2="16" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
              <line x1="3"  y1="19" x2="9"  y2="19" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              <text x="11" y="22"
                fill="var(--accent)"
                fontFamily="'Arial Black','Impact','Helvetica Neue',sans-serif"
                fontSize="13"
                fontWeight="900"
                letterSpacing="-0.5">AO</text>
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-arena-text">
            Arena<span className="text-arena-accent">OPS</span>
          </span>
        </div>
        <button
          className="lg:hidden text-arena-text-muted hover:text-arena-text"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        <button
          ref={(node) => {
            menuItemRefs.current[0] = node;
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-arena-accent hover:bg-arena-accent-hover text-arena-bg font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(232,255,71,0.15)] hover:shadow-[0_0_25px_rgba(232,255,71,0.3)] transition-all active:scale-95"
          onClick={() => {
            navigate("/create");
            handleNav();
          }}
          onKeyDown={(e) => handleMenuItemKeyDown(e, 0)}
        >
          <Plus size={18} />
          New Tournament
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
        <p className="px-3 text-xs font-semibold text-arena-text-muted uppercase tracking-wider mb-2">
          Menu
        </p>

        {/* Search */}
        <div className="relative mb-2" ref={searchRef}>
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-arena-text-muted pointer-events-none"
          />
          <input
            className="w-full bg-arena-surface-hover border border-arena-border rounded-lg pl-8 pr-3 py-2 text-xs text-arena-text placeholder-arena-text-muted outline-none focus:border-arena-accent/50 transition-colors"
            placeholder="Search tournaments, players..."
            value={appSearchQuery}
            onChange={(e) => {
              setAppSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {showResults && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-arena-surface border border-arena-border rounded-lg shadow-2xl overflow-hidden">
              {results.map((r, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-left border-b border-arena-border last:border-0 ${i === effectiveFocusedResultIndex ? "bg-arena-surface-hover" : "hover:bg-arena-surface-hover"}`}
                  onClick={() => handleSelectResult(r.path)}
                  onMouseEnter={() => setFocusedResultIndex(i)}
                >
                  <r.icon size={13} className="text-arena-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-arena-text truncate">
                      {r.label}
                    </p>
                    <p className="text-xs text-arena-text-muted truncate">
                      {r.sub}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {showResults &&
            appSearchQuery.trim().length > 0 &&
            results.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-arena-surface border border-arena-border rounded-lg shadow-2xl px-3 py-3 text-xs text-arena-text-muted">
                No results for "{appSearchQuery}"
              </div>
            )}
        </div>

        {navItems.map(({ to, icon: Icon, label, useBadge }, index) => (
          <NavLink
            ref={(node) => {
              menuItemRefs.current[index + 1] = node;
            }}
            key={to}
            to={to}
            end={to === "/dashboard"}
            onClick={handleNav}
            onKeyDown={(e) => handleMenuItemKeyDown(e, index + 1)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? "bg-arena-surface-hover text-arena-text shadow-lg"
                  : "text-arena-text-muted hover:bg-arena-surface-hover hover:text-arena-text"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-arena-accent rounded-r-full" />
                )}
                <Icon
                  size={18}
                  className={`${isActive ? "text-arena-accent" : "text-arena-text-muted group-hover:text-arena-text"} ${to === "/live" && hasLiveMatches ? "animate-[pulse_2.2s_ease-in-out_infinite]" : ""}`}
                />
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
            <p className="text-sm font-semibold text-arena-text truncate">
              {name}
            </p>
            <p className="text-xs text-arena-text-muted">Organizer</p>
          </div>
        </div>
        <button
          onClick={() => {
            navigate("/");
            handleNav();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-arena-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}

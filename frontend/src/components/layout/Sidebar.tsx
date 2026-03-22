import { NavLink, useNavigate } from "react-router-dom";
import {
  Trophy,
  LayoutGrid,
  Users,
  Calendar,
  Bell,
  Settings,
  Plus,
  Zap,
  MapPin,
  X,
  LogOut,
  Search,
  Clock,
} from "lucide-react";
import { useApp } from "../../store/useApp";
import { useState, useRef, useEffect } from "react";
import { formatTimeRange } from "../../utils/time";

const navItems = [
  { to: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
  { to: "/tournaments", icon: Trophy, label: "Tournaments" },
  { to: "/participants", icon: Users, label: "Participants" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
  { to: "/live", icon: Zap, label: "Live Control" },
  { to: "/rooms", icon: MapPin, label: "Room Booking" },
  { to: "/notifications", icon: Bell, label: "Notifications", useBadge: true },
  { to: "/settings", icon: Settings, label: "Settings" },
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
        name: "Admin User",
        email: "demo@arenaops.gg",
        university: "ArenaOPS",
      },
    } as any;
  }
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

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { tournaments, notifications } = useApp() || {
    tournaments: [],
    notifications: [],
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.toLowerCase().trim();

  const settingsSections = [
    "Profile",
    "Appearance",
    "Time & Timezone",
    "Notifications",
    "Schedule Preferences",
    "Participant Preferences",
    "Tournament Defaults",
  ];

  const results =
    q.length < 1
      ? []
      : [
          // Dashboard
          ...(["dashboard", "overview", "stats", "home"].some((k) =>
            k.includes(q),
          )
            ? [
                {
                  label: "Dashboard",
                  sub: "Overview & stats",
                  icon: LayoutGrid,
                  path: "/dashboard",
                },
              ]
            : []),
          // Tournaments
          ...(tournaments ?? [])
            .filter(
              (t) =>
                t.name.toLowerCase().includes(q) ||
                t.game.toLowerCase().includes(q) ||
                t.format.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q),
            )
            .map((t) => ({
              label: t.name,
              sub: `${t.game} · ${t.status}`,
              icon: Trophy,
              path: `/tournaments/${t.id}`,
            })),
          // Participants
          ...(tournaments ?? []).flatMap((t) =>
            t.participants
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(q) ||
                  p.email.toLowerCase().includes(q) ||
                  p.status.toLowerCase().includes(q),
              )
              .map((p) => ({
                label: p.name,
                sub: p.email,
                icon: Users,
                path: "/participants",
              })),
          ),
          // Schedule / matches
          ...(tournaments ?? []).flatMap((t) =>
            t.matches
              .filter((m) => {
                const p1 =
                  t.participants.find((p) => p.id === m.participant1Id)?.name ??
                  "";
                const p2 =
                  t.participants.find((p) => p.id === m.participant2Id)?.name ??
                  "";
                return (
                  p1.toLowerCase().includes(q) ||
                  p2.toLowerCase().includes(q) ||
                  m.status.toLowerCase().includes(q)
                );
              })
              .map((m) => {
                const p1 =
                  t.participants.find((p) => p.id === m.participant1Id)?.name ??
                  "TBD";
                const p2 =
                  t.participants.find((p) => p.id === m.participant2Id)?.name ??
                  "TBD";
                return {
                  label: `${p1} vs ${p2}`,
                  sub: `Schedule · ${m.status}`,
                  icon: Calendar,
                  path: "/schedule",
                };
              }),
          ),
          // Live Control — live/delayed matches
          ...(tournaments ?? []).flatMap((t) =>
            t.matches
              .filter(
                (m) =>
                  (m.status === "live" || m.status === "delayed") &&
                  (["live", "delay", "control"].some((k) => k.includes(q)) ||
                    (
                      t.participants.find((p) => p.id === m.participant1Id)
                        ?.name ?? ""
                    )
                      .toLowerCase()
                      .includes(q) ||
                    (
                      t.participants.find((p) => p.id === m.participant2Id)
                        ?.name ?? ""
                    )
                      .toLowerCase()
                      .includes(q)),
              )
              .map((m) => {
                const p1 =
                  t.participants.find((p) => p.id === m.participant1Id)?.name ??
                  "TBD";
                const p2 =
                  t.participants.find((p) => p.id === m.participant2Id)?.name ??
                  "TBD";
                return {
                  label: `${p1} vs ${p2}`,
                  sub: `Live Control · ${m.status}`,
                  icon: Zap,
                  path: "/live",
                };
              }),
          ),
          // Room Booking — locations
          ...(tournaments ?? []).flatMap((t) =>
            t.locations
              .filter(
                (l) =>
                  l.name.toLowerCase().includes(q) ||
                  l.building.toLowerCase().includes(q),
              )
              .map((l) => ({
                label: l.name,
                sub: `Room Booking · ${l.building}`,
                icon: MapPin,
                path: "/rooms",
              })),
          ),
          // Notifications
          ...(notifications ?? [])
            .filter(
              (n) =>
                n.title.toLowerCase().includes(q) ||
                n.message.toLowerCase().includes(q),
            )
            .map((n) => ({
              label: n.title,
              sub: n.message.slice(0, 50),
              icon: Bell,
              path: "/notifications",
            })),
          // Settings sections
          ...settingsSections
            .filter((s) => s.toLowerCase().includes(q))
            .map((s) => ({
              label: s,
              sub: "Settings",
              icon: Settings,
              path: "/settings",
            })),
          // Time blocks
          ...(tournaments ?? []).flatMap((t) =>
            t.timeBlocks
              .filter((tb) => tb.label.toLowerCase().includes(q))
              .map((tb) => ({
                label: tb.label,
                sub: `Schedule · ${formatTimeRange(tb.start, tb.end, tb.date, timePrefs.format, timePrefs.timezone)}`,
                icon: Clock,
                path: "/schedule",
              })),
          ),
        ]
          .filter(
            (r, i, arr) =>
              arr.findIndex((x) => x.label === r.label && x.path === r.path) ===
              i,
          )
          .slice(0, 8);

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-y-0 border-l-0 rounded-none flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-arena-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-arena-accent/10 rounded-md text-arena-accent">
            <Zap size={20} className="fill-current" />
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
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-arena-accent hover:bg-arena-accent-hover text-arena-bg font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(232,255,71,0.15)] hover:shadow-[0_0_25px_rgba(232,255,71,0.3)] transition-all active:scale-95"
          onClick={() => {
            navigate("/create");
            handleNav();
          }}
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
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          {showResults && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-arena-surface border border-arena-border rounded-lg shadow-2xl overflow-hidden">
              {results.map((r, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-arena-surface-hover transition-colors text-left border-b border-arena-border last:border-0"
                  onClick={() => {
                    navigate(r.path);
                    setQuery("");
                    setShowResults(false);
                    handleNav();
                  }}
                >
                  <r.icon
                    size={13}
                    className="text-arena-accent shrink-0"
                  />
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
          {showResults && q.length > 0 && results.length === 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-arena-surface border border-arena-border rounded-lg shadow-2xl px-3 py-3 text-xs text-arena-text-muted">
              No results for "{query}"
            </div>
          )}
        </div>

        {navItems.map(({ to, icon: Icon, label, useBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            onClick={handleNav}
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
                  className={`${isActive ? "text-arena-accent" : "text-arena-text-muted group-hover:text-arena-text"}`}
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

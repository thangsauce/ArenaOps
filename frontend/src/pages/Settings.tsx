import { useState, useRef, useEffect } from 'react';
import {
  Clock, Sun, Bell, Trophy, Calendar, Users, User,
  ChevronDown, ChevronRight, Check, Volume2, VolumeX
} from 'lucide-react';
import {
  useApp, TIMEZONES,
  type TimeFormat, type Timezone, type Theme, type Density,
  type DefaultFormat, type DefaultMaxParticipants, type WeekStart,
  type DefaultScheduleView, type DefaultBracketView, type ParticipantSort,
} from '../store/store';
import { formatTime } from '../utils/time';
import { motion, AnimatePresence } from 'framer-motion';

const PREVIEW_DATE = '2026-03-15';

// ── Custom Dropdown ───────────────────────────────────────────────────────────
interface DropdownOption<T extends string> { value: T; label: string; sub?: string; }

function Dropdown<T extends string>({
  value, options, onChange, placeholder,
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`relative w-full max-w-sm ${open ? 'z-50' : 'z-10'}`} ref={ref}>
      <button
        className={`w-full flex items-center justify-between px-3 py-2 bg-arena-surface-hover border ${open ? 'border-arena-accent/50 bg-arena-accent/[0.04] shadow-[0_0_18px_rgba(var(--accent-rgb),0.14)]' : 'border-arena-border'} hover:bg-arena-border rounded-xl transition-all text-left`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex flex-col">
          {selected ? (
            <>
              <span className="text-sm font-semibold text-arena-text">{selected.label}</span>
              {selected.sub && <span className="text-xs text-arena-text-muted">{selected.sub}</span>}
            </>
          ) : <span className="text-sm text-arena-text-muted">{placeholder ?? 'Select…'}</span>}
        </div>
        <ChevronDown size={16} className={`text-arena-text-muted transition-transform duration-200 ${open ? 'rotate-180 text-arena-accent' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-arena-surface border border-arena-border rounded-xl shadow-2xl overflow-hidden"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-arena-surface-hover transition-colors border-b border-arena-border last:border-0"
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${opt.value === value ? 'text-arena-accent' : 'text-arena-text'}`}>{opt.label}</span>
                  {opt.sub && <span className="text-xs text-arena-text-muted mt-0.5">{opt.sub}</span>}
                </div>
                {opt.value === value && <Check size={16} className="text-arena-accent" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-arena-accent/50 focus:ring-offset-2 focus:ring-offset-arena-bg ${checked ? 'bg-arena-accent' : 'bg-gray-400 dark:bg-gray-700'}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  icon: Icon, title, desc, children, defaultOpen = true, zIndex = 10,
}: {
  icon: React.ElementType; title: string; desc: string; children: React.ReactNode; defaultOpen?: boolean; zIndex?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="mb-3 data-[density=compact]:mb-2 glass-card overflow-visible relative"
      style={{ zIndex }}
    >
      <button
        className={`w-full flex items-center justify-between p-4 data-[density=compact]:p-3 tracking-wide text-left transition-all duration-200 ${
          open
            ? 'bg-arena-accent/[0.08] border-b border-arena-accent/15 rounded-t-2xl'
            : 'rounded-2xl'
        }`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 data-[density=compact]:gap-2">
          <div
            className={`p-2 rounded-lg transition-colors ${
              open
                ? 'bg-arena-accent/15 text-arena-accent shadow-[0_0_18px_rgba(var(--accent-rgb),0.12)]'
                : 'bg-arena-surface-hover text-arena-text-muted'
            }`}
          >
            <Icon size={16} />
          </div>
          <div>
            <h3
              className={`text-sm font-bold tracking-tight transition-colors ${
                open ? 'text-arena-accent' : 'text-arena-text'
              }`}
            >
              {title}
            </h3>
            <p className="text-xs text-arena-text-muted mt-0.5">{desc}</p>
          </div>
        </div>
        <ChevronRight
          size={16}
          className={`transition-transform duration-200 ${
            open ? 'rotate-90 text-arena-accent' : 'text-arena-text-muted'
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-visible"
          >
            <div className="px-4 data-[density=compact]:px-3 pb-3 divide-y divide-arena-border/70">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 data-[density=compact]:gap-2 py-3 data-[density=compact]:py-2 w-full">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-arena-text">{label}</p>
        {sub && <p className="text-xs text-arena-text-muted mt-1 leading-relaxed">{sub}</p>}
      </div>
      <div className="shrink-0 w-full sm:w-auto flex justify-end">
        {children}
      </div>
    </div>
  );
}

// ── Chip group ────────────────────────────────────────────────────────────────
function ChipGroup<T extends string>({
  value, options, onChange,
}: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-2 p-1 bg-arena-surface-hover rounded-xl border border-arena-border w-fit">
      {options.map(o => (
        <button
          key={o.value}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${value === o.value ? 'bg-arena-accent text-arena-bg shadow-md' : 'text-arena-text-muted hover:text-arena-text hover:bg-arena-border'}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
  const state = useApp();
  // Provide safe defaults if state is undefined
  const settings = state?.settings || {
    timePrefs: { timezone: 'UTC', format: '12h' as TimeFormat },
    appearance: { theme: 'dark' as Theme, density: 'comfortable' as Density },
    notifications: { matchStart: true, delays: true, noShows: true, roomChanges: true, sound: false },
    tournamentDefaults: { format: 'single-elimination' as DefaultFormat, maxParticipants: '16' as DefaultMaxParticipants, organizerName: 'Admin' },
    schedulePrefs: { defaultView: 'grid' as DefaultScheduleView, weekStart: 'monday' as WeekStart },
    bracketPrefs: { defaultView: 'flow' as DefaultBracketView },
    participantPrefs: { sortBy: 'seed' as ParticipantSort, hideDeclined: false },
    profile: { name: 'Admin User', email: '', university: '' }
  };
  const updateSettings = state?.updateSettings || (() => { });

  const { timePrefs, appearance, notifications, tournamentDefaults, schedulePrefs, bracketPrefs, participantPrefs, profile } = settings;

  const [profileForm, setProfileForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    updateSettings({ profile: profileForm });
    updateSettings({ tournamentDefaults: { ...tournamentDefaults, organizerName: profileForm.name } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentTz = TIMEZONES.find((t: typeof TIMEZONES[0]) => t.value === timePrefs.timezone) || TIMEZONES[0];

  return (
    <div className="w-full px-10 pt-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-5 border-b border-arena-border">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-arena-text">Settings</h1>
          <p className="text-arena-text-muted text-xs font-medium mt-2">Customize your ArenaOPS experience</p>
        </div>
      </div>

      {/* ── Profile ── */}
      <Section icon={User} title="Profile" desc="Your organizer identity across all tournaments" defaultOpen={false} zIndex={70}>
        <Row label="Display name" sub="Shown on tournaments you create">
          <input
            className="w-full sm:w-80 bg-arena-surface-hover border border-arena-border rounded-xl px-4 py-2.5 text-sm text-arena-text focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium"
            value={profileForm.name}
            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
          />
        </Row>
        <Row label="Email" sub="Used for notifications and invites">
          <input
            className="w-full sm:w-80 bg-arena-surface-hover border border-arena-border rounded-xl px-4 py-2.5 text-sm text-arena-text focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium"
            type="email"
            value={profileForm.email}
            onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
          />
        </Row>
        <Row label="University" sub="Shown on your tournament pages">
          <input
            className="w-full sm:w-80 bg-arena-surface-hover border border-arena-border rounded-xl px-4 py-2.5 text-sm text-arena-text focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium"
            value={profileForm.university}
            onChange={e => setProfileForm(p => ({ ...p, university: e.target.value }))}
          />
        </Row>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <div className="hidden sm:block max-w-md flex-1" aria-hidden="true" />
          <div className="shrink-0 w-full sm:w-80 flex justify-end">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-arena-accent text-[rgba(255,255,255,0.9)] dark:text-arena-bg font-bold rounded-lg shadow-[0_0_10px_rgba(var(--accent-rgb),0.15)] hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] transition-all active:scale-95"
              onClick={saveProfile}
            >
              {saved ? <><Check size={16} /> Saved!</> : 'Save Profile'}
            </button>
          </div>
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section icon={Sun} title="Appearance" desc="Theme and layout density" defaultOpen={false} zIndex={60}>
        <Row label="Theme" sub="Controls the color scheme across the app. Automatically syncs with AppLayout.">
          <Dropdown<Theme>
            value={appearance.theme}
            onChange={theme => updateSettings({ appearance: { ...appearance, theme } })}
            options={[
              { value: 'dark', label: 'Arena Dark', sub: 'High Contrast' },
              { value: 'light', label: 'Arena Light', sub: 'Clean View' },
              { value: 'system', label: 'System', sub: 'Device Default' },
            ]}
          />
        </Row>
        <Row label="Density" sub="Controls row spacing in tables and lists">
          <ChipGroup<Density>
            value={appearance.density}
            onChange={density => updateSettings({ appearance: { ...appearance, density } })}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
        </Row>
      </Section>

      {/* ── Time & Timezone ── */}
      <Section icon={Clock} title="Time & Timezone" desc="How times appear across Schedule and match views" defaultOpen={false} zIndex={50}>
        <Row
          label="Time format"
          sub={`Preview: ${formatTime('18:30', PREVIEW_DATE, timePrefs.format, timePrefs.timezone)}`}
        >
          <ChipGroup<TimeFormat>
            value={timePrefs.format}
            onChange={format => updateSettings({ timePrefs: { ...timePrefs, format } })}
            options={[
              { value: '12h', label: '12-hour (AM/PM)' },
              { value: '24h', label: '24-hour' },
            ]}
          />
        </Row>
        <Row label="Timezone" sub={`All match times converted to this zone · Active: ${currentTz.label} (${currentTz.abbr})`}>
          <Dropdown<Timezone>
            value={timePrefs.timezone}
            onChange={timezone => updateSettings({ timePrefs: { ...timePrefs, timezone } })}
            options={TIMEZONES.map((tz: typeof TIMEZONES[0]) => ({ value: tz.value, label: tz.label, sub: tz.abbr }))}
          />
        </Row>
      </Section>

      {/* ── Notifications ── */}
      <Section icon={Bell} title="Notifications" desc="Choose which events trigger in-app notifications" defaultOpen={false} zIndex={40}>
        {([
          { key: 'matchStart', label: 'Match started', sub: 'When a match goes live' },
          { key: 'delays', label: 'Match delays', sub: 'When a match is pushed back' },
          { key: 'noShows', label: 'No-shows', sub: 'When a participant is marked absent' },
          { key: 'roomChanges', label: 'Room changes', sub: 'When a location is reassigned' },
        ] as { key: keyof typeof notifications; label: string; sub: string }[]).map(({ key, label, sub }) => (
          <Row key={key} label={label} sub={sub}>
            <Toggle
              checked={notifications[key] as boolean}
              onChange={v => updateSettings({ notifications: { ...notifications, [key]: v } })}
            />
          </Row>
        ))}
        <Row label="Sound alerts" sub="Play a sound when notifications arrive">
          <div className="flex items-center gap-3">
            {notifications.sound ? <Volume2 size={16} className="text-arena-accent" /> : <VolumeX size={16} className="text-arena-text-muted" />}
            <Toggle
              checked={notifications.sound}
              onChange={v => updateSettings({ notifications: { ...notifications, sound: v } })}
            />
          </div>
        </Row>
      </Section>

      {/* ── Schedule Preferences ── */}
      <Section icon={Calendar} title="Schedule Preferences" desc="Default view and layout for the schedule page" defaultOpen={false} zIndex={38}>
        <Row label="Default view" sub="How the schedule is displayed when you open it">
          <ChipGroup<DefaultScheduleView>
            value={schedulePrefs.defaultView}
            onChange={defaultView => updateSettings({ schedulePrefs: { ...schedulePrefs, defaultView } })}
            options={[
              { value: 'grid', label: 'Grid' },
              { value: 'list', label: 'List' },
            ]}
          />
        </Row>
        <Row label="Week starts on" sub="First day shown in weekly schedule views">
          <ChipGroup<WeekStart>
            value={schedulePrefs.weekStart}
            onChange={weekStart => updateSettings({ schedulePrefs: { ...schedulePrefs, weekStart } })}
            options={[
              { value: 'monday', label: 'Monday' },
              { value: 'sunday', label: 'Sunday' },
            ]}
          />
        </Row>
      </Section>

      <Section icon={Trophy} title="Bracket Preferences" desc="Choose how tournament brackets open by default" defaultOpen={false} zIndex={37}>
        <Row label="Default bracket view" sub="How brackets are shown when you open a tournament">
          <ChipGroup<DefaultBracketView>
            value={bracketPrefs.defaultView}
            onChange={defaultView => updateSettings({ bracketPrefs: { defaultView } })}
            options={[
              { value: 'flow', label: 'Flow' },
              { value: 'tree', label: 'Tree' },
              { value: 'list', label: 'List' },
            ]}
          />
        </Row>
      </Section>

      {/* ── Participant Preferences ── */}
      <Section icon={Users} title="Participant Preferences" desc="Control how participants are displayed and filtered" defaultOpen={false} zIndex={35}>
        <Row label="Sort participants by" sub="Default ordering in participant lists">
          <Dropdown<ParticipantSort>
            value={participantPrefs.sortBy}
            onChange={sortBy => updateSettings({ participantPrefs: { ...participantPrefs, sortBy } })}
            options={[
              { value: 'seed', label: 'Seed' },
              { value: 'name', label: 'Name' },
              { value: 'status', label: 'Status' },
            ]}
          />
        </Row>
        <Row label="Hide declined participants" sub="Remove declined entries from participant lists">
          <Toggle
            checked={participantPrefs.hideDeclined}
            onChange={v => updateSettings({ participantPrefs: { ...participantPrefs, hideDeclined: v } })}
          />
        </Row>
      </Section>

      {/* ── Tournament Defaults ── */}
      <Section icon={Trophy} title="Tournament Defaults" desc="Pre-fill values when creating a new tournament" defaultOpen={false} zIndex={30}>
        <Row label="Default format" sub="Pre-selected when opening Create Tournament">
          <Dropdown<DefaultFormat>
            value={tournamentDefaults.format}
            onChange={format => updateSettings({ tournamentDefaults: { ...tournamentDefaults, format } })}
            options={[
              { value: 'single-elimination', label: 'Single Elimination' },
              { value: 'double-elimination', label: 'Double Elimination' },
              { value: 'round-robin', label: 'Round Robin' },
              { value: 'swiss', label: 'Swiss' },
            ]}
          />
        </Row>
        <Row label="Default max participants">
          <Dropdown<DefaultMaxParticipants>
            value={tournamentDefaults.maxParticipants}
            onChange={maxParticipants => updateSettings({ tournamentDefaults: { ...tournamentDefaults, maxParticipants } })}
            options={['4', '8', '16', '32', '64'].map(n => ({ value: n as DefaultMaxParticipants, label: `${n} players` }))}
          />
        </Row>
        <Row label="Default organizer name" sub="Pre-fills the organizer field">
          <input
            className="w-full sm:w-80 bg-arena-surface-hover border border-arena-border rounded-xl px-4 py-2.5 text-sm text-arena-text focus:outline-none focus:border-arena-accent/50 focus:ring-1 focus:ring-arena-accent/50 transition-all font-medium"
            value={tournamentDefaults.organizerName}
            onChange={e => updateSettings({ tournamentDefaults: { ...tournamentDefaults, organizerName: e.target.value } })}
          />
        </Row>
      </Section>
    </div>
  );
}

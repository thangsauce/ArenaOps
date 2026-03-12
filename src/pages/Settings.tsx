import { useState, useRef, useEffect } from 'react';
import {
  Clock, Sun, Bell, Trophy, Calendar, Users, User,
  ChevronDown, ChevronRight, Check, Volume2, VolumeX
} from 'lucide-react';
import {
  useApp, TIMEZONES,
  type TimeFormat, type Timezone, type Theme, type Density,
  type DefaultFormat, type DefaultMaxParticipants, type WeekStart,
  type DefaultScheduleView, type ParticipantSort,
} from '../store/store';
import { formatTime } from '../utils/time';
import styles from './Settings.module.css';

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
    <div className={styles.dropdown} ref={ref}>
      <button className={`${styles.dropTrigger} ${open ? styles.dropOpen : ''}`} onClick={() => setOpen(o => !o)}>
        <span className={styles.dropValue}>
          {selected ? (
            <>
              <span>{selected.label}</span>
              {selected.sub && <span className={styles.dropSub}>{selected.sub}</span>}
            </>
          ) : <span className={styles.dropPlaceholder}>{placeholder ?? 'Select…'}</span>}
        </span>
        <ChevronDown size={14} className={`${styles.dropArrow} ${open ? styles.dropArrowOpen : ''}`} />
      </button>
      {open && (
        <div className={styles.dropMenu}>
          {options.map(opt => (
            <button
              key={opt.value}
              className={`${styles.dropItem} ${opt.value === value ? styles.dropItemActive : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className={styles.dropItemText}>
                <span>{opt.label}</span>
                {opt.sub && <span className={styles.dropItemSub}>{opt.sub}</span>}
              </span>
              {opt.value === value && <Check size={13} className={styles.dropItemCheck} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  icon: Icon, title, desc, children, defaultOpen = false,
}: {
  icon: React.ElementType; title: string; desc: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.sectionLeft}>
          <div className={styles.sectionIconWrap}><Icon size={15} /></div>
          <div>
            <p className={styles.sectionTitle}>{title}</p>
            <p className={styles.sectionDesc}>{desc}</p>
          </div>
        </div>
        <ChevronRight size={16} className={`${styles.sectionChevron} ${open ? styles.sectionChevronOpen : ''}`} />
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <span>{label}</span>
        {sub && <span className={styles.rowSub}>{sub}</span>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

// ── Chip group ────────────────────────────────────────────────────────────────
function ChipGroup<T extends string>({
  value, options, onChange,
}: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className={styles.chipGroup}>
      {options.map(o => (
        <button
          key={o.value}
          className={`${styles.chip} ${value === o.value ? styles.chipActive : ''}`}
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
  const { settings, updateSettings } = useApp();
  const { timePrefs, appearance, notifications, tournamentDefaults, schedulePrefs, participantPrefs, profile } = settings;

  const [profileForm, setProfileForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    updateSettings({ profile: profileForm });
    updateSettings({ tournamentDefaults: { ...tournamentDefaults, organizerName: profileForm.name } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentTz = TIMEZONES.find(t => t.value === timePrefs.timezone)!;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.sub}>Customize your ArenaOPS experience</p>
      </div>

      {/* ── Profile ── */}
      <Section icon={User} title="Profile" desc="Your organizer identity across all tournaments">
        <Row label="Display name" sub="Shown on tournaments you create">
          <input
            className={styles.textInput}
            value={profileForm.name}
            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
          />
        </Row>
        <Row label="Email" sub="Used for notifications and invites">
          <input
            className={styles.textInput}
            type="email"
            value={profileForm.email}
            onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
          />
        </Row>
        <Row label="University" sub="Shown on your tournament pages">
          <input
            className={styles.textInput}
            value={profileForm.university}
            onChange={e => setProfileForm(p => ({ ...p, university: e.target.value }))}
          />
        </Row>
        <div className={styles.saveRow}>
          <button className={styles.saveBtn} onClick={saveProfile}>
            {saved ? <><Check size={13} /> Saved!</> : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section icon={Sun} title="Appearance" desc="Theme and layout density">
        <Row label="Theme" sub="Controls the color scheme across the app">
          <Dropdown<Theme>
            value={appearance.theme}
            onChange={theme => updateSettings({ appearance: { ...appearance, theme } })}
            options={[
              { value: 'dark',   label: 'Dark',   sub: 'Default' },
              { value: 'light',  label: 'Light' },
              { value: 'system', label: 'System', sub: 'Follows OS' },
            ]}
          />
        </Row>
        <Row label="Density" sub="Controls row spacing in tables and lists">
          <ChipGroup<Density>
            value={appearance.density}
            onChange={density => updateSettings({ appearance: { ...appearance, density } })}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact',     label: 'Compact' },
            ]}
          />
        </Row>
      </Section>

      {/* ── Time & Timezone ── */}
      <Section icon={Clock} title="Time & Timezone" desc="How times appear across Schedule and match views">
        <Row label="Time format">
          <ChipGroup<TimeFormat>
            value={timePrefs.format}
            onChange={format => updateSettings({ timePrefs: { ...timePrefs, format } })}
            options={[
              { value: '12h', label: '12-hour (AM/PM)' },
              { value: '24h', label: '24-hour (Military)' },
            ]}
          />
        </Row>
        <Row label="Timezone" sub="All match times converted to this zone">
          <Dropdown<Timezone>
            value={timePrefs.timezone}
            onChange={timezone => updateSettings({ timePrefs: { ...timePrefs, timezone } })}
            options={TIMEZONES.map(tz => ({ value: tz.value, label: tz.label, sub: tz.abbr }))}
          />
        </Row>
        {/* Live preview */}
        <div className={styles.previewCard}>
          <p className={styles.previewCardLabel}>Preview · {currentTz.label} ({currentTz.abbr})</p>
          <div className={styles.previewSlots}>
            {[
              { label: 'Morning',   start: '09:00', end: '12:00' },
              { label: 'Afternoon', start: '13:00', end: '17:00' },
              { label: 'Evening',   start: '18:00', end: '21:00' },
            ].map(s => (
              <div key={s.label} className={styles.previewSlot}>
                <span className={styles.previewSlotLabel}>{s.label}</span>
                <span className={styles.previewSlotTime}>
                  {formatTime(s.start, PREVIEW_DATE, timePrefs.format, timePrefs.timezone)}
                  {' – '}
                  {formatTime(s.end, PREVIEW_DATE, timePrefs.format, timePrefs.timezone)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Notifications ── */}
      <Section icon={Bell} title="Notifications" desc="Choose which events trigger in-app notifications">
        {([
          { key: 'matchStart',  label: 'Match started',   sub: 'When a match goes live' },
          { key: 'delays',      label: 'Match delays',    sub: 'When a match is pushed back' },
          { key: 'noShows',     label: 'No-shows',        sub: 'When a participant is marked absent' },
          { key: 'roomChanges', label: 'Room changes',    sub: 'When a location is reassigned' },
        ] as { key: keyof typeof notifications; label: string; sub: string }[]).map(({ key, label, sub }) => (
          <Row key={key} label={label} sub={sub}>
            <Toggle
              checked={notifications[key] as boolean}
              onChange={v => updateSettings({ notifications: { ...notifications, [key]: v } })}
            />
          </Row>
        ))}
        <Row label="Sound alerts" sub="Play a sound when notifications arrive">
          <div className={styles.soundRow}>
            {notifications.sound ? <Volume2 size={14} style={{ color: 'var(--accent)' }} /> : <VolumeX size={14} style={{ color: 'var(--text-3)' }} />}
            <Toggle
              checked={notifications.sound}
              onChange={v => updateSettings({ notifications: { ...notifications, sound: v } })}
            />
          </div>
        </Row>
      </Section>

      {/* ── Tournament Defaults ── */}
      <Section icon={Trophy} title="Tournament Defaults" desc="Pre-fill values when creating a new tournament">
        <Row label="Default format" sub="Pre-selected when opening Create Tournament">
          <Dropdown<DefaultFormat>
            value={tournamentDefaults.format}
            onChange={format => updateSettings({ tournamentDefaults: { ...tournamentDefaults, format } })}
            options={[
              { value: 'single-elimination', label: 'Single Elimination' },
              { value: 'double-elimination', label: 'Double Elimination' },
              { value: 'round-robin',        label: 'Round Robin' },
              { value: 'swiss',              label: 'Swiss' },
            ]}
          />
        </Row>
        <Row label="Default max participants">
          <Dropdown<DefaultMaxParticipants>
            value={tournamentDefaults.maxParticipants}
            onChange={maxParticipants => updateSettings({ tournamentDefaults: { ...tournamentDefaults, maxParticipants } })}
            options={['4','8','16','32','64'].map(n => ({ value: n as DefaultMaxParticipants, label: `${n} players` }))}
          />
        </Row>
        <Row label="Default organizer name" sub="Pre-fills the organizer field">
          <input
            className={styles.textInput}
            value={tournamentDefaults.organizerName}
            onChange={e => updateSettings({ tournamentDefaults: { ...tournamentDefaults, organizerName: e.target.value } })}
          />
        </Row>
      </Section>

      {/* ── Schedule ── */}
      <Section icon={Calendar} title="Schedule" desc="Layout and navigation preferences for the Schedule page">
        <Row label="Default view" sub="Which view opens by default">
          <ChipGroup<DefaultScheduleView>
            value={schedulePrefs.defaultView}
            onChange={defaultView => updateSettings({ schedulePrefs: { ...schedulePrefs, defaultView } })}
            options={[
              { value: 'grid', label: 'Grid' },
              { value: 'list', label: 'List' },
            ]}
          />
        </Row>
        <Row label="Week starts on">
          <ChipGroup<WeekStart>
            value={schedulePrefs.weekStart}
            onChange={weekStart => updateSettings({ schedulePrefs: { ...schedulePrefs, weekStart } })}
            options={[
              { value: 'sunday',  label: 'Sunday' },
              { value: 'monday',  label: 'Monday' },
            ]}
          />
        </Row>
      </Section>

      {/* ── Participants ── */}
      <Section icon={Users} title="Participants" desc="How the participants table is sorted and filtered">
        <Row label="Default sort order" sub="Order when opening the Participants page">
          <Dropdown<ParticipantSort>
            value={participantPrefs.sortBy}
            onChange={sortBy => updateSettings({ participantPrefs: { ...participantPrefs, sortBy } })}
            options={[
              { value: 'seed',   label: 'By seed',   sub: '#1, #2, #3…' },
              { value: 'name',   label: 'By name',   sub: 'A → Z' },
              { value: 'status', label: 'By status', sub: 'Confirmed first' },
            ]}
          />
        </Row>
        <Row label="Hide declined participants" sub="Remove declined players from the table">
          <Toggle
            checked={participantPrefs.hideDeclined}
            onChange={v => updateSettings({ participantPrefs: { ...participantPrefs, hideDeclined: v } })}
          />
        </Row>
      </Section>
    </div>
  );
}

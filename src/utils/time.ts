import type { TimeFormat, Timezone } from '../store/settings';

/**
 * Converts a "HH:MM" time string (assumed to be in Eastern Time / tournament base tz)
 * into the target timezone and formats it as 12h or 24h.
 *
 * We treat the mock data times as America/New_York and convert from there.
 */
export function formatTime(
  timeStr: string,        // e.g. "09:00"
  dateStr: string,        // e.g. "2026-03-15"
  format: TimeFormat,
  timezone: Timezone,
): string {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Build a Date in the source timezone (ET = America/New_York)
    const sourceDate = new Date(`${dateStr}T${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00`);

    return sourceDate.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: format === '12h',
    });
  } catch {
    return timeStr;
  }
}

/** Format a time range like "09:00 – 12:00" */
export function formatTimeRange(
  start: string,
  end: string,
  dateStr: string,
  format: TimeFormat,
  timezone: Timezone,
): string {
  return `${formatTime(start, dateStr, format, timezone)} – ${formatTime(end, dateStr, format, timezone)}`;
}

import type { TimeFormat, Timezone } from '../store/settings';

const SOURCE_TIMEZONE = 'America/New_York';

/**
 * Converts a "HH:MM" time string (assumed to be in Eastern Time / tournament base tz)
 * into the target timezone and formats it as 12h or 24h.
 *
 * Uses the Intl offset-trick to correctly handle DST for the given date.
 */
export function formatTime(
  timeStr: string,        // e.g. "09:00"
  dateStr: string,        // e.g. "2026-03-15"
  format: TimeFormat,
  timezone: Timezone,
): string {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Build a naive UTC date from the time string
    const naiveUtc = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00Z`);

    // Find what the naive UTC time looks like in the source timezone (ET)
    const etLocal = new Date(naiveUtc.toLocaleString('en-US', { timeZone: SOURCE_TIMEZONE }));

    // Compute the offset and adjust so naiveUtc represents the correct UTC instant for 'timeStr' in ET
    const offsetMs = naiveUtc.getTime() - etLocal.getTime();
    const sourceDate = new Date(naiveUtc.getTime() + offsetMs);

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

export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  },
): string {
  try {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', options);
  } catch {
    return dateStr;
  }
}

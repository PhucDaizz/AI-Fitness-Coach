/**
 * Format a date to locale string
 * @example formatDate(new Date()) => "29/04/2026"
 */
export function formatDate(
  date: Date | string, 
  locale = 'vi-VN'
): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format a date with time
 * @example formatDateTime(new Date()) => "29/04/2026, 14:30"
 */
export function formatDateTime(
  date: Date | string, 
  locale = 'vi-VN'
): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Get relative time string
 * @example getRelativeTime(yesterday) => "1 ngày trước"
 */
export function getRelativeTime(
  date: Date | string, 
  locale = 'vi-VN'
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffMs = new Date(date).getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour');
  return rtf.format(diffMinutes, 'minute');
}

/**
 * Get day of week label (Monday, Tuesday...)
 */
export function getDayLabel(
  date: Date | string, 
  locale = 'vi-VN'
): string {
  return new Intl.DateTimeFormat(
    locale, 
    { weekday: 'long' }
  ).format(new Date(date));
}

/**
 * Check if two dates are the same calendar day
 */
export function isSameDay(
  a: Date | string, 
  b: Date | string
): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * Format duration in minutes to readable string
 * @example formatDuration(90) => "1h 30m"
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

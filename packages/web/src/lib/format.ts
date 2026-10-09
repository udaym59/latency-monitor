import { format, formatDistanceToNowStrict } from 'date-fns';

const EMPTY = '—';

/** 45_000 → "45s", 754_000 → "12m 34s", 11_520_000 → "3h 12m", 2 days → "2d 4h" */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function formatLatency(ms: number | null | undefined): string {
  if (ms == null) return EMPTY;
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;
}

export function formatUptime(percent: number | null | undefined): string {
  if (percent == null) return EMPTY;
  return `${percent === 100 ? '100' : percent.toFixed(2)}%`;
}

/** "2 min ago" — compact, for lists that re-render on every poll. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  if (Date.now() - date.getTime() < 10_000) return 'Just now';
  return `${formatDistanceToNowStrict(date).replace(/ minutes?/, ' min').replace(/ seconds?/, 's')} ago`;
}

/** "Oct 7, 14:32:05" */
export function formatTimestamp(iso: string): string {
  return format(new Date(iso), 'MMM d, HH:mm:ss');
}

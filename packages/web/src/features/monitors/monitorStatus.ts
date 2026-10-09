import type { Check, Monitor } from '@uptime/shared';

export type MonitorStatus = 'up' | 'down' | 'paused' | 'unknown';

export function monitorStatus(monitor: Monitor, lastCheck: Check | null | undefined): MonitorStatus {
  if (monitor.isPaused) return 'paused';
  if (!lastCheck) return 'unknown';
  return lastCheck.ok ? 'up' : 'down';
}

export const STATUS_LABEL: Record<MonitorStatus, string> = {
  up: 'Up',
  down: 'Down',
  paused: 'Paused',
  unknown: 'Pending',
};

export const STATUS_TONE = {
  up: 'success',
  down: 'danger',
  paused: 'warning',
  unknown: 'neutral',
} as const satisfies Record<MonitorStatus, string>;

import type { Monitor, MonitorStats } from '@uptime/shared';
import clsx from 'clsx';
import { Pause, Pencil, Play, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { StatusDot } from '../../components/StatusDot';
import { formatLatency, formatRelative, formatUptime } from '../../lib/format';
import { MonitorActionsMenu } from './MonitorActionsMenu';
import { MonitorFormModal } from './MonitorFormModal';
import { STATUS_LABEL, monitorStatus } from './monitorStatus';
import { useDeleteMonitor, useUpdateMonitor } from './useMonitors';

export function MonitorCard({
  monitor,
  stats,
  statsLoading,
}: {
  monitor: Monitor;
  stats: MonitorStats | undefined;
  statsLoading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateMonitor();
  const remove = useDeleteMonitor();
  const status = monitorStatus(monitor, stats?.lastCheck);
  const busy = update.isPending || remove.isPending;

  return (
    <Card
      className={clsx(
        'group relative p-5 transition-colors hover:border-foreground/15',
        monitor.isPaused && 'bg-surface',
        busy && 'pointer-events-none opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <StatusDot status={statsLoading && !monitor.isPaused ? 'checking' : status} />
            <h3 className="truncate text-base">
              {/* Stretched link: whole card navigates, menu sits above it */}
              <Link
                to={`/monitors/${monitor.id}`}
                className="inline-block max-w-full truncate py-0.5 align-middle after:absolute after:inset-0 after:rounded-xl"
              >
                {monitor.name}
              </Link>
            </h3>
            {monitor.isPaused && <Badge tone="warning">Paused</Badge>}
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted" title={monitor.url}>
            {monitor.url.replace(/^https?:\/\//, '')}
          </p>
        </div>
        <div className="relative z-10 -mr-1.5 -mt-1">
          <MonitorActionsMenu
            label={`Actions for ${monitor.name}`}
            actions={[
              { label: 'Edit', icon: Pencil, onSelect: () => setEditing(true) },
              monitor.isPaused
                ? { label: 'Resume', icon: Play, onSelect: () => update.mutate({ id: monitor.id, patch: { isPaused: false } }) }
                : { label: 'Pause', icon: Pause, onSelect: () => update.mutate({ id: monitor.id, patch: { isPaused: true } }) },
              {
                label: 'Delete',
                icon: Trash2,
                danger: true,
                onSelect: () => {
                  if (window.confirm(`Delete “${monitor.name}”? Its check history and incidents are removed too.`)) {
                    remove.mutate(monitor.id);
                  }
                },
              },
            ]}
          />
        </div>
      </div>

      <dl className={clsx('mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4', monitor.isPaused && 'text-muted')}>
        <MiniStat label="Uptime 24h" loading={statsLoading}>
          {stats && stats.totalChecks > 0 ? formatUptime(stats.uptimePercent) : '—'}
        </MiniStat>
        <MiniStat label="Last check" loading={statsLoading} mono={false}>
          {formatRelative(stats?.lastCheck?.checkedAt)}
        </MiniStat>
        <MiniStat label="p95" loading={statsLoading}>
          {formatLatency(stats?.p95LatencyMs)}
        </MiniStat>
      </dl>

      {!monitor.isPaused && <span className="sr-only">Status: {STATUS_LABEL[status]}</span>}

      <MonitorFormModal open={editing} onClose={() => setEditing(false)} monitor={monitor} />
    </Card>
  );
}

function MiniStat({
  label,
  loading,
  mono = true,
  children,
}: {
  label: string;
  loading: boolean;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={clsx('mt-0.5 truncate', mono && 'font-mono tabular-nums')}>
        {loading ? <Skeleton className="mt-1 h-4 w-14" /> : children}
      </dd>
    </div>
  );
}

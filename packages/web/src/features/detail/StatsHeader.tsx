import type { Monitor, MonitorStats } from '@uptime/shared';
import { ExternalLink, Pause, Pencil, Play, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { StatusDot } from '../../components/StatusDot';
import { formatLatency, formatRelative, formatUptime } from '../../lib/format';

type Status = 'up' | 'down' | 'paused' | 'unknown';

export function StatsHeader({
  monitor,
  stats,
  statsLoading,
  status,
  statusLabel,
  statusTone,
  busy,
  onEdit,
  onTogglePause,
  onDelete,
}: {
  monitor: Monitor;
  stats: MonitorStats | undefined;
  statsLoading: boolean;
  status: Status;
  statusLabel: string;
  statusTone: 'success' | 'danger' | 'warning' | 'neutral';
  busy: boolean;
  onEdit: () => void;
  onTogglePause: () => void;
  onDelete: () => void;
}) {
  const hasData = stats !== undefined && stats.totalChecks > 0;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4 p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-2xl">{monitor.name}</h1>
            {monitor.isPaused && <Badge tone="warning">Paused</Badge>}
          </div>
          <a
            href={monitor.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 inline-flex max-w-full items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-foreground"
          >
            <span className="truncate">{monitor.url}</span>
            <ExternalLink aria-hidden className="size-3 shrink-0" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <p className="mt-2 text-xs text-muted">
            Every {monitor.intervalMinutes === 60 ? 'hour' : `${monitor.intervalMinutes} min`} · last checked{' '}
            {statsLoading ? '…' : formatRelative(stats?.lastCheck?.checkedAt).toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onEdit} disabled={busy}>
            <Pencil aria-hidden />
            Edit
          </Button>
          <Button size="sm" onClick={onTogglePause} disabled={busy}>
            {monitor.isPaused ? <Play aria-hidden /> : <Pause aria-hidden />}
            {monitor.isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} disabled={busy} className="text-danger hover:bg-danger/5">
            <Trash2 aria-hidden />
            Delete
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 divide-border border-t border-border md:grid-cols-4 md:divide-x">
        <Stat label="Status">
          <Badge tone={statusTone}>
            <StatusDot status={status} />
            {statusLabel}
          </Badge>
        </Stat>
        <Stat label="Uptime (24h)" loading={statsLoading} mono>
          {hasData ? formatUptime(stats.uptimePercent) : '—'}
        </Stat>
        <Stat label="p50 latency" loading={statsLoading} mono>
          {formatLatency(stats?.p50LatencyMs)}
        </Stat>
        <Stat label="p95 latency" loading={statsLoading} mono>
          {formatLatency(stats?.p95LatencyMs)}
        </Stat>
      </dl>
    </Card>
  );
}

function Stat({
  label,
  loading = false,
  mono = false,
  children,
}: {
  label: string;
  loading?: boolean;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="px-6 py-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={mono ? 'mt-1 font-mono text-xl font-medium tabular-nums' : 'mt-1.5'}>
        {loading ? <Skeleton className="h-7 w-20" /> : children}
      </dd>
    </div>
  );
}

export function StatsHeaderSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Loading monitor">
      <div className="space-y-2 p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="grid grid-cols-2 border-t border-border md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 px-6 py-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

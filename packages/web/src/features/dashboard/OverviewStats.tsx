import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { StatusDot } from '../../components/StatusDot';
import { formatUptime } from '../../lib/format';

export function OverviewStats({
  loading,
  total,
  paused,
  up,
  down,
  avgUptime,
}: {
  loading: boolean;
  total: number;
  paused: number;
  up: number;
  down: number;
  avgUptime: number | null;
}) {
  return (
    <section aria-label="Overview" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <Kpi loading={loading} label="Total monitors" hint={paused > 0 ? `${paused} paused` : undefined}>
        {total}
      </Kpi>
      <Kpi loading={loading} label="Up" dot="up">
        {up}
      </Kpi>
      <Kpi loading={loading} label="Down" dot="down" alert={down > 0}>
        {down}
      </Kpi>
      <Kpi loading={loading} label="Avg uptime (24h)">
        {formatUptime(avgUptime)}
      </Kpi>
    </section>
  );
}

function Kpi({
  label,
  hint,
  dot,
  alert,
  loading,
  children,
}: {
  label: string;
  hint?: string | undefined;
  dot?: 'up' | 'down';
  alert?: boolean;
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      {loading ? (
        <Skeleton className="h-9 w-20" />
      ) : (
        <p className={clsx('font-mono text-3xl font-medium tracking-tight tabular-nums', alert && 'text-danger')}>
          {children}
        </p>
      )}
      <p className="mt-1 flex items-center gap-2 text-muted">
        {dot && <StatusDot status={dot} />}
        {label}
        {hint && !loading && <span className="text-xs">· {hint}</span>}
      </p>
    </Card>
  );
}

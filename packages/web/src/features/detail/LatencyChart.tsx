import type { Check } from '@uptime/shared';
import { format } from 'date-fns';
import { LineChart as LineChartIcon } from 'lucide-react';
import { useMemo } from 'react';
import { ComposedChart, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Skeleton } from '../../components/Skeleton';
import { formatDuration, formatLatency } from '../../lib/format';

const WINDOW_MS = 24 * 60 * 60 * 1000;
const HEIGHT = 280;
const AXIS_TICK = { fill: '#737373', fontSize: 11 };

type Point = { t: number; latency: number | null; failed: number | null; ok: boolean; error: string | null };

export function LatencyChart({
  checks,
  isPending,
  error,
  onRetry,
  limit,
}: {
  checks: Check[] | undefined;
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  limit: number;
}) {
  const { points, rangeLabel, failures } = useMemo(() => {
    const since = Date.now() - WINDOW_MS;
    const points: Point[] = (checks ?? [])
      .filter((c) => Date.parse(c.checkedAt) >= since)
      .map((c) => ({
        t: Date.parse(c.checkedAt),
        latency: c.latencyMs,
        // Failed checks get a red marker; timeouts (no latency) sit on the baseline.
        failed: c.ok ? null : (c.latencyMs ?? 0),
        ok: c.ok,
        error: c.error,
      }))
      .reverse(); // API returns newest first
    const truncated = (checks?.length ?? 0) >= limit && points.length > 1;
    const span = points.length > 1 ? points.at(-1)!.t - points[0]!.t : 0;
    return {
      points,
      failures: points.filter((p) => !p.ok).length,
      rangeLabel: truncated ? `Last ${formatDuration(span)} · ${limit} most recent checks` : 'Last 24 hours',
    };
  }, [checks, limit]);

  if (error) return <ErrorState title="Couldn’t load checks" error={error} onRetry={onRetry} />;

  return (
    <Card aria-labelledby="latency-heading">
      <div className="flex items-baseline justify-between gap-4 px-6 pt-5">
        <div>
          <h2 id="latency-heading" className="text-base">
            Response time
          </h2>
          <p className="text-xs text-muted">{isPending ? 'Loading…' : rangeLabel}</p>
        </div>
        {failures > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span aria-hidden className="size-2 rounded-full bg-danger" />
            {failures} failed {failures === 1 ? 'check' : 'checks'}
          </p>
        )}
      </div>

      <div className="px-2 pb-4 pt-4">
        {isPending ? (
          <Skeleton className="mx-4 h-[280px]" />
        ) : points.length === 0 ? (
          <div style={{ height: HEIGHT }} className="flex items-center justify-center">
            <EmptyState
              icon={LineChartIcon}
              title="No checks in the last 24 hours"
              description="Data appears here after the first check runs."
            />
          </div>
        ) : (
          <figure aria-label={`Response time chart, ${points.length} checks, ${rangeLabel.toLowerCase()}`}>
            <ResponsiveContainer width="100%" height={HEIGHT}>
              <ComposedChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="t"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(t: number) => format(t, 'HH:mm')}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={48}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(v: number) => `${v} ms`}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  cursor={{ stroke: '#EAEAEA' }}
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    const point = active ? (payload?.[0]?.payload as Point | undefined) : undefined;
                    if (!point) return null;
                    return (
                      <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-sm">
                        <p className="text-muted">{format(point.t, 'MMM d, HH:mm:ss')}</p>
                        <p className="mt-0.5 font-mono font-medium tabular-nums">{formatLatency(point.latency)}</p>
                        {!point.ok && <p className="mt-0.5 text-danger">{point.error ?? 'Failed'}</p>}
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#2563EB"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0, fill: '#2563EB' }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
                <Scatter dataKey="failed" fill="#DC2626" shape="circle" isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </figure>
        )}
      </div>
    </Card>
  );
}

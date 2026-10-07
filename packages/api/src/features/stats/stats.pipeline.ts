import type { MonitorStats } from '@uptime/shared';
import { checksCol, monitorsCol } from '../../db';

const WINDOW_MS = 24 * 60 * 60 * 1000;

type Aggregate = { total: number; uptimePercent: number; p50: number | null; p95: number | null };

/** Returns null when the monitor doesn't exist. Requires MongoDB 7.0+ ($percentile). */
export async function getMonitorStats(monitorId: string): Promise<MonitorStats | null> {
  const since = new Date(Date.now() - WINDOW_MS);

  const [exists, [agg], last] = await Promise.all([
    monitorsCol().countDocuments({ id: monitorId }, { limit: 1 }),
    checksCol()
      .aggregate<Aggregate>([
        { $match: { monitorId, checkedAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            up: { $sum: { $cond: ['$ok', 1, 0] } },
            // Non-numeric (null) latencies — timeouts, DNS failures — are ignored.
            latency: { $percentile: { input: '$latencyMs', p: [0.5, 0.95], method: 'approximate' } },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            uptimePercent: { $round: [{ $multiply: [{ $divide: ['$up', '$total'] }, 100] }, 2] },
            p50: { $round: [{ $arrayElemAt: ['$latency', 0] }, 0] },
            p95: { $round: [{ $arrayElemAt: ['$latency', 1] }, 0] },
          },
        },
      ])
      .toArray(),
    checksCol().findOne({ monitorId }, { sort: { checkedAt: -1 }, projection: { _id: 0 } }),
  ]);

  if (!exists) return null;

  return {
    monitorId,
    uptimePercent: agg?.uptimePercent ?? 100, // no checks in window → nothing has failed
    p50LatencyMs: agg?.p50 ?? null,
    p95LatencyMs: agg?.p95 ?? null,
    lastCheck: last && { ...last, checkedAt: last.checkedAt.toISOString() },
    totalChecks: agg?.total ?? 0,
  };
}

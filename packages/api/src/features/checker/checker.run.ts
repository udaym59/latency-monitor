import type { AnyBulkWriteOperation } from 'mongodb';
import { checksCol, incidentsCol, type CheckDoc, type IncidentDoc, type MonitorDoc } from '../../db';
import { listActiveMonitors } from '../monitors/monitors.db';
import { httpCheck } from './checker.http';

// node-cron fires at ~:00 each minute; without slack, a 1-min monitor checked at 12:00:00.050
// would be 59.98s "old" at 12:01:00.030 and skip a beat.
const DUE_GRACE_MS = 10_000;

export type RunSummary = { checked: number; down: number; opened: number; resolved: number };

export async function runChecker(now = new Date()): Promise<RunSummary> {
  const monitors = await listActiveMonitors();
  const lastCheckedAt = await latestCheckTimes(monitors.map((m) => m.id));
  const due = monitors.filter((m) => isDue(m, lastCheckedAt.get(m.id) ?? m.createdAt, now));
  if (due.length === 0) return { checked: 0, down: 0, opened: 0, resolved: 0 };

  const results = await Promise.allSettled(due.map((m) => httpCheck(m.url)));
  const checks: CheckDoc[] = results.map((result, i) => ({
    monitorId: due[i]!.id,
    checkedAt: now,
    ...(result.status === 'fulfilled'
      ? result.value
      : { ok: false, statusCode: null, latencyMs: null, error: String(result.reason) }),
  }));

  await checksCol().insertMany(checks, { ordered: false });
  const { opened, resolved } = await syncIncidents(checks, now);

  return { checked: checks.length, down: checks.filter((c) => !c.ok).length, opened, resolved };
}

function isDue(monitor: MonitorDoc, lastCheckedAt: Date, now: Date): boolean {
  return now.getTime() - lastCheckedAt.getTime() >= monitor.intervalMinutes * 60_000 - DUE_GRACE_MS;
}

/** One round trip: latest checkedAt per monitor (DISTINCT_SCAN on { monitorId, checkedAt: -1 }). */
async function latestCheckTimes(monitorIds: string[]): Promise<Map<string, Date>> {
  if (monitorIds.length === 0) return new Map();
  const rows = await checksCol()
    .aggregate<{ _id: string; last: Date }>([
      { $match: { monitorId: { $in: monitorIds } } },
      { $sort: { monitorId: 1, checkedAt: -1 } },
      { $group: { _id: '$monitorId', last: { $first: '$checkedAt' } } },
    ])
    .toArray();
  return new Map(rows.map((r) => [r._id, r.last]));
}

/**
 * Down + no open incident → open one (upsert; partial unique index guarantees one open per monitor).
 * Down + open → refresh lastError. Up + open → resolve. Up + none → no-op.
 */
async function syncIncidents(checks: CheckDoc[], now: Date): Promise<{ opened: number; resolved: number }> {
  const upIds = checks.filter((c) => c.ok).map((c) => c.monitorId);
  const openOps: AnyBulkWriteOperation<IncidentDoc>[] = checks
    .filter((c) => !c.ok)
    .map((c) => ({
      updateOne: {
        filter: { monitorId: c.monitorId, resolvedAt: null },
        update: { $set: { lastError: c.error }, $setOnInsert: { startedAt: now } },
        upsert: true,
      },
    }));

  const [openResult, resolveResult] = await Promise.all([
    openOps.length ? incidentsCol().bulkWrite(openOps, { ordered: false }) : null,
    upIds.length
      ? incidentsCol().updateMany({ monitorId: { $in: upIds }, resolvedAt: null }, { $set: { resolvedAt: now } })
      : null,
  ]);
  return { opened: openResult?.upsertedCount ?? 0, resolved: resolveResult?.modifiedCount ?? 0 };
}

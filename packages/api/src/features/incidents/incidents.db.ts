import type { Incident } from '@uptime/shared';
import { incidentsCol, monitorsCol } from '../../db';

const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_INCIDENTS = 100;

export async function monitorExists(id: string): Promise<boolean> {
  return (await monitorsCol().countDocuments({ id }, { limit: 1 })) > 0;
}

/** Open incidents first, then most recent; resolved ones limited to the last 30 days. */
export async function listIncidents(monitorId: string): Promise<Incident[]> {
  const since = new Date(Date.now() - WINDOW_MS);
  const docs = await incidentsCol()
    .find(
      { monitorId, $or: [{ resolvedAt: null }, { startedAt: { $gte: since } }] },
      { projection: { _id: 0 } },
    )
    .sort({ startedAt: -1 })
    .limit(MAX_INCIDENTS)
    .toArray();

  return docs
    .map((doc) => ({
      ...doc,
      startedAt: doc.startedAt.toISOString(),
      resolvedAt: doc.resolvedAt?.toISOString() ?? null,
    }))
    .sort((a, b) => Number(a.resolvedAt !== null) - Number(b.resolvedAt !== null)); // stable: keeps date order
}

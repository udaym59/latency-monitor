import type { Check } from '@uptime/shared';
import { checksCol, monitorsCol } from '../../db';

export async function monitorExists(id: string): Promise<boolean> {
  return (await monitorsCol().countDocuments({ id }, { limit: 1 })) > 0;
}

export async function listChecks(monitorId: string, limit: number): Promise<Check[]> {
  const docs = await checksCol()
    .find({ monitorId }, { projection: { _id: 0 } })
    .sort({ checkedAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((doc) => ({ ...doc, checkedAt: doc.checkedAt.toISOString() }));
}

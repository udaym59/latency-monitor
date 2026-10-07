import type { Monitor } from '@uptime/shared';
import { nanoid } from 'nanoid';
import { checksCol, incidentsCol, monitorsCol, type MonitorDoc } from '../../db';
import type { CreateMonitorInput, UpdateMonitorInput } from './monitors.schema';

const NO_ID = { projection: { _id: 0 } } as const;

const toMonitor = (doc: MonitorDoc): Monitor => ({ ...doc, createdAt: doc.createdAt.toISOString() });

export async function listMonitors(): Promise<Monitor[]> {
  const docs = await monitorsCol().find({}, NO_ID).sort({ createdAt: -1 }).toArray();
  return docs.map(toMonitor);
}

export async function getMonitor(id: string): Promise<Monitor | null> {
  const doc = await monitorsCol().findOne({ id }, NO_ID);
  return doc && toMonitor(doc);
}

export async function createMonitor(input: CreateMonitorInput): Promise<Monitor> {
  const doc: MonitorDoc = { id: nanoid(10), ...input, createdAt: new Date(), isPaused: false };
  await monitorsCol().insertOne({ ...doc }); // copy: insertOne mutates its arg with _id
  return toMonitor(doc);
}

export async function updateMonitor(id: string, patch: UpdateMonitorInput): Promise<Monitor | null> {
  const doc = await monitorsCol().findOneAndUpdate(
    { id },
    { $set: patch },
    { ...NO_ID, returnDocument: 'after' },
  );
  return doc && toMonitor(doc);
}

/** Deletes the monitor first (so the checker stops picking it up), then its history. */
export async function deleteMonitorCascade(id: string): Promise<boolean> {
  const { deletedCount } = await monitorsCol().deleteOne({ id });
  if (deletedCount === 0) return false;
  await Promise.all([checksCol().deleteMany({ monitorId: id }), incidentsCol().deleteMany({ monitorId: id })]);
  return true;
}

export function listActiveMonitors(): Promise<MonitorDoc[]> {
  return monitorsCol().find({ isPaused: false }, NO_ID).toArray();
}

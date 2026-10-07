import type { Check, Incident, Monitor } from '@uptime/shared';
import { MongoClient, type Db } from 'mongodb';
import { env } from './env';

// Stored shapes: timestamps are BSON Dates (TTL + range queries need real dates).
// Features map them to the ISO-string types in @uptime/shared at the response boundary.
export type MonitorDoc = Omit<Monitor, 'createdAt'> & { createdAt: Date };
export type CheckDoc = Omit<Check, 'checkedAt'> & { checkedAt: Date };
export type IncidentDoc = Omit<Incident, 'startedAt' | 'resolvedAt'> & {
  startedAt: Date;
  resolvedAt: Date | null;
};

const CHECK_TTL_SECONDS = 7 * 24 * 60 * 60;

let client: MongoClient | null = null;
let connecting: Promise<MongoClient> | null = null;

export function connectMongo(): Promise<MongoClient> {
  connecting ??= (async () => {
    const c = new MongoClient(env.MONGO_URI, {
      appName: 'uptime-monitor-api',
      serverSelectionTimeoutMS: 10_000,
    });
    await c.connect();
    client = c;
    await ensureIndexes();
    return c;
  })().catch((err: unknown) => {
    connecting = null;
    throw err;
  });
  return connecting;
}

export async function closeMongo(): Promise<void> {
  await client?.close();
  client = null;
  connecting = null;
}

export function db(): Db {
  if (!client) throw new Error('Mongo not connected — call connectMongo() first');
  return client.db(env.MONGO_DB_NAME);
}

export const monitorsCol = () => db().collection<MonitorDoc>('monitors');
export const checksCol = () => db().collection<CheckDoc>('checks');
export const incidentsCol = () => db().collection<IncidentDoc>('incidents');

async function ensureIndexes(): Promise<void> {
  const created = await Promise.all([
    monitorsCol().createIndexes([{ key: { id: 1 }, name: 'id_unique', unique: true }]),
    checksCol().createIndexes([
      { key: { monitorId: 1, checkedAt: -1 }, name: 'monitor_checkedAt' },
      { key: { checkedAt: 1 }, name: 'checkedAt_ttl', expireAfterSeconds: CHECK_TTL_SECONDS },
    ]),
    incidentsCol().createIndexes([
      { key: { monitorId: 1, startedAt: -1 }, name: 'monitor_startedAt' },
      // At most one open incident per monitor — makes the checker's upsert race-safe.
      {
        key: { monitorId: 1 },
        name: 'monitor_open_unique',
        unique: true,
        partialFilterExpression: { resolvedAt: { $type: 'null' } },
      },
    ]),
  ]);
  console.log(`Mongo indexes ensured: ${created.flat().join(', ')}`);
}

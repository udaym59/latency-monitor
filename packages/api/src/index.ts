import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { closeMongo, connectMongo } from './db';
import { env } from './env';
import { startChecker, stopChecker } from './features/checker/checker.cron';
import { checksRouter } from './features/checks/checks.route';
import { healthRouter } from './features/health/health.route';
import { incidentsRouter } from './features/incidents/incidents.route';
import { monitorsRouter } from './features/monitors/monitors.route';
import { statsRouter } from './features/stats/stats.route';

try {
  await connectMongo();
  console.log(`Mongo connected (db: ${env.MONGO_DB_NAME})`);
} catch (err) {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
}

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));

app.use('/health', healthRouter);
app.use('/monitors/:id/checks', checksRouter);
app.use('/monitors/:id/stats', statsRouter);
app.use('/monitors/:id/incidents', incidentsRouter);
app.use('/monitors', monitorsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Express 5 forwards rejected promises from async handlers here.
const onError: ErrorRequestHandler = (err: { status?: number; message?: string }, _req, res, _next) => {
  const status = typeof err.status === 'number' && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : (err.message ?? 'Bad request') });
};
app.use(onError);

startChecker();

const server = app.listen(env.PORT, (err) => {
  if (err) throw err;
  console.log(`API listening on http://localhost:${env.PORT}`);
});

// Stop producing work first (cron), then drain HTTP, then release Mongo.
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  console.log(`${signal} received, shutting down`);
  setTimeout(() => process.exit(1), 10_000).unref();
  await stopChecker();
  server.close(async (err) => {
    await closeMongo();
    process.exit(err ? 1 : 0);
  });
  server.closeIdleConnections();
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

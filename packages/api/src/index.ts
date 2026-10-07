import cors from 'cors';
import express from 'express';
import { env } from './env';
import { healthRouter } from './features/health/health.route';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use('/health', healthRouter);

const server = app.listen(env.PORT, (err) => {
  if (err) throw err;
  console.log(`API listening on http://localhost:${env.PORT}`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`${signal} received, shutting down`);
  server.close((err) => process.exit(err ? 1 : 0));
  server.closeIdleConnections();
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

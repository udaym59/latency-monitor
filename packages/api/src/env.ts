import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');

function parsePort(raw: string | undefined): number {
  const port = Number(raw ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: "${raw}"`);
  }
  return port;
}

export const env = Object.freeze({
  PORT: parsePort(process.env.PORT),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
});

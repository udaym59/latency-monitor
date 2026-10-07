export type HealthResponse = {
  status: 'ok';
  timestamp: string;
  service: 'uptime-monitor-api';
};

export type Monitor = {
  id: string; // nanoid, 10 chars
  name: string;
  url: string;
  intervalMinutes: number; // 1, 5, 10, 15, 30, 60
  createdAt: string; // ISO
  isPaused: boolean;
};

export type Check = {
  monitorId: string;
  checkedAt: string; // ISO
  ok: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  error: string | null;
};

export type Incident = {
  monitorId: string;
  startedAt: string;
  resolvedAt: string | null;
  lastError: string | null;
};

export type MonitorStats = {
  monitorId: string;
  uptimePercent: number; // 0–100, last 24h
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
  lastCheck: Check | null;
  totalChecks: number;
};

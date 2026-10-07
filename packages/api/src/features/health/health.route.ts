import { Router, type Response } from 'express';
import type { HealthResponse } from '@uptime/shared';

export const healthRouter = Router();

healthRouter.get('/', (_req, res: Response<HealthResponse>) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'uptime-monitor-api',
  });
});

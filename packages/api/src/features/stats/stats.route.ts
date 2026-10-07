import type { MonitorStats } from '@uptime/shared';
import { Router, type Request, type Response } from 'express';
import { getMonitorStats } from './stats.pipeline';

// Mounted at /monitors/:id/stats — mergeParams exposes the parent's :id.
export const statsRouter = Router({ mergeParams: true });

statsRouter.get('/', async (req: Request<{ id: string }>, res: Response<MonitorStats | { error: string }>) => {
  const stats = await getMonitorStats(req.params.id);
  if (!stats) return void res.status(404).json({ error: 'Monitor not found' });
  res.json(stats);
});

import type { Incident } from '@uptime/shared';
import { Router, type Request, type Response } from 'express';
import { listIncidents, monitorExists } from './incidents.db';

// Mounted at /monitors/:id/incidents — mergeParams exposes the parent's :id.
export const incidentsRouter = Router({ mergeParams: true });

incidentsRouter.get('/', async (req: Request<{ id: string }>, res: Response<Incident[] | { error: string }>) => {
  if (!(await monitorExists(req.params.id))) {
    return void res.status(404).json({ error: 'Monitor not found' });
  }
  res.json(await listIncidents(req.params.id));
});

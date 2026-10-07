import type { Monitor } from '@uptime/shared';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  createMonitor,
  deleteMonitorCascade,
  getMonitor,
  listMonitors,
  updateMonitor,
} from './monitors.db';
import { createMonitorSchema, monitorIdSchema, updateMonitorSchema } from './monitors.schema';

type ErrorBody = { error: string; issues?: unknown };
type IdReq = Request<{ id: string }>;

const NOT_FOUND: ErrorBody = { error: 'Monitor not found' };
const invalid = (error: z.ZodError): ErrorBody => ({
  error: 'Invalid request body',
  issues: z.flattenError(error),
});

export const monitorsRouter = Router();

monitorsRouter.get('/', async (_req, res: Response<Monitor[]>) => {
  res.json(await listMonitors());
});

monitorsRouter.post('/', async (req, res: Response<Monitor | ErrorBody>) => {
  const body = createMonitorSchema.safeParse(req.body);
  if (!body.success) return void res.status(400).json(invalid(body.error));
  res.status(201).json(await createMonitor(body.data));
});

monitorsRouter.get('/:id', async (req: IdReq, res: Response<Monitor | ErrorBody>) => {
  const monitor = monitorIdSchema.safeParse(req.params.id).success && (await getMonitor(req.params.id));
  if (!monitor) return void res.status(404).json(NOT_FOUND);
  res.json(monitor);
});

monitorsRouter.patch('/:id', async (req: IdReq, res: Response<Monitor | ErrorBody>) => {
  if (!monitorIdSchema.safeParse(req.params.id).success) return void res.status(404).json(NOT_FOUND);
  const body = updateMonitorSchema.safeParse(req.body);
  if (!body.success) return void res.status(400).json(invalid(body.error));
  const monitor = await updateMonitor(req.params.id, body.data);
  if (!monitor) return void res.status(404).json(NOT_FOUND);
  res.json(monitor);
});

monitorsRouter.delete('/:id', async (req: IdReq, res: Response<ErrorBody>) => {
  const deleted =
    monitorIdSchema.safeParse(req.params.id).success && (await deleteMonitorCascade(req.params.id));
  if (!deleted) return void res.status(404).json(NOT_FOUND);
  res.status(204).end();
});

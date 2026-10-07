import type { Check } from '@uptime/shared';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { listChecks, monitorExists } from './checks.db';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

type ErrorBody = { error: string; issues?: unknown };

// Mounted at /monitors/:id/checks — mergeParams exposes the parent's :id.
export const checksRouter = Router({ mergeParams: true });

checksRouter.get('/', async (req: Request<{ id: string }>, res: Response<Check[] | ErrorBody>) => {
  const query = querySchema.safeParse(req.query);
  if (!query.success) {
    return void res
      .status(400)
      .json({ error: 'Invalid query', issues: z.flattenError(query.error) });
  }
  if (!(await monitorExists(req.params.id))) {
    return void res.status(404).json({ error: 'Monitor not found' });
  }
  res.json(await listChecks(req.params.id, query.data.limit));
});

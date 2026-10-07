import { z } from 'zod';

export const INTERVAL_MINUTES = [1, 5, 10, 15, 30, 60] as const;

const name = z.string().trim().min(1).max(100);
const url = z.url({ protocol: /^https?$/ }).max(2048);
const intervalMinutes = z.literal(INTERVAL_MINUTES);

export const createMonitorSchema = z.strictObject({ name, url, intervalMinutes });

// exactOptional: absent keys stay absent (never `undefined`), so the result is a valid Mongo $set.
export const updateMonitorSchema = z
  .strictObject({
    name: name.exactOptional(),
    url: url.exactOptional(),
    intervalMinutes: intervalMinutes.exactOptional(),
    isPaused: z.boolean().exactOptional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

export const monitorIdSchema = z.string().regex(/^[A-Za-z0-9_-]{10}$/);

export type CreateMonitorInput = z.infer<typeof createMonitorSchema>;
export type UpdateMonitorInput = z.infer<typeof updateMonitorSchema>;

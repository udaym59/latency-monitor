import { schedule, type ScheduledTask } from 'node-cron';
import { runChecker } from './checker.run';

let task: ScheduledTask | null = null;

export function startChecker(): void {
  if (task) return;
  task = schedule(
    '* * * * *',
    async () => {
      const startedAt = Date.now();
      try {
        const s = await runChecker();
        if (s.checked > 0) {
          console.log(
            `[checker] ${s.checked} checked, ${s.down} down, ${s.opened} incidents opened, ` +
              `${s.resolved} resolved (${Date.now() - startedAt}ms)`,
          );
        }
      } catch (err) {
        console.error('[checker] run failed', err); // swallow: a bad tick must not kill the schedule
      }
    },
    { name: 'uptime-checker', noOverlap: true },
  );
  console.log('Checker scheduled: every minute');
}

export async function stopChecker(): Promise<void> {
  await task?.destroy();
  task = null;
}

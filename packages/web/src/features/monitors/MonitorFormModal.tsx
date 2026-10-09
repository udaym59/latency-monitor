import type { Monitor } from '@uptime/shared';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { useCreateMonitor, useUpdateMonitor, type MonitorPatch } from './useMonitors';

const INTERVALS = [1, 5, 10, 15, 30, 60] as const;

type Errors = Partial<Record<'name' | 'url', string>>;

export function MonitorFormModal({
  open,
  onClose,
  monitor,
}: {
  open: boolean;
  onClose: () => void;
  monitor?: Monitor; // present → edit mode
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={monitor ? 'Edit monitor' : 'Add monitor'}
      description={monitor ? undefined : 'We’ll send a GET request on the interval you choose.'}
    >
      {/* Remounts on every open, so state always starts from the monitor */}
      <MonitorForm monitor={monitor} onDone={onClose} />
    </Modal>
  );
}

function MonitorForm({ monitor, onDone }: { monitor: Monitor | undefined; onDone: () => void }) {
  const [name, setName] = useState(monitor?.name ?? '');
  const [url, setUrl] = useState(monitor?.url ?? 'https://');
  const [intervalMinutes, setIntervalMinutes] = useState(monitor?.intervalMinutes ?? 5);
  const [isPaused, setIsPaused] = useState(monitor?.isPaused ?? false);
  const [errors, setErrors] = useState<Errors>({});

  const create = useCreateMonitor();
  const update = useUpdateMonitor();
  const mutation = monitor ? update : create;
  const ids = { name: useId(), url: useId(), interval: useId(), paused: useId() };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const input = { name: name.trim(), url: url.trim(), intervalMinutes };
    const nextErrors = validate(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!monitor) return create.mutate(input, { onSuccess: onDone });

    const patch: MonitorPatch = {};
    if (input.name !== monitor.name) patch.name = input.name;
    if (input.url !== monitor.url) patch.url = input.url;
    if (input.intervalMinutes !== monitor.intervalMinutes) patch.intervalMinutes = input.intervalMinutes;
    if (isPaused !== monitor.isPaused) patch.isPaused = isPaused;
    if (Object.keys(patch).length === 0) return onDone();
    update.mutate({ id: monitor.id, patch }, { onSuccess: onDone });
  }

  return (
    <form noValidate onSubmit={onSubmit}>
      <fieldset disabled={mutation.isPending} className="space-y-4">
        <Field id={ids.name} label="Name" error={errors.name}>
          <Input
            id={ids.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Marketing site"
            maxLength={100}
            data-autofocus
            autoComplete="off"
            aria-invalid={!!errors.name || undefined}
            aria-describedby={errors.name ? `${ids.name}-error` : undefined}
          />
        </Field>

        <Field id={ids.url} label="URL" error={errors.url}>
          <Input
            id={ids.url}
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/health"
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!errors.url || undefined}
            aria-describedby={errors.url ? `${ids.url}-error` : undefined}
          />
        </Field>

        <Field id={ids.interval} label="Check every">
          <Select
            id={ids.interval}
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(Number(e.target.value))}
          >
            {INTERVALS.map((m) => (
              <option key={m} value={m}>
                {m === 60 ? '1 hour' : `${m} minute${m === 1 ? '' : 's'}`}
              </option>
            ))}
          </Select>
        </Field>

        {monitor && (
          <label htmlFor={ids.paused} className="flex items-center gap-2.5 py-1">
            <input
              id={ids.paused}
              type="checkbox"
              checked={isPaused}
              onChange={(e) => setIsPaused(e.target.checked)}
              className="size-4 rounded border-border accent-accent"
            />
            <span>Paused</span>
            <span className="text-muted">— no checks run while paused</span>
          </label>
        )}

        {mutation.error && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-danger-strong">
            {mutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {mutation.isPending ? 'Saving…' : monitor ? 'Save changes' : 'Add monitor'}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function validate({ name, url }: { name: string; url: string }): Errors {
  const errors: Errors = {};
  if (!name) errors.name = 'Name is required';
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error();
  } catch {
    errors.url = 'Enter a valid http(s) URL, e.g. https://example.com';
  }
  return errors;
}

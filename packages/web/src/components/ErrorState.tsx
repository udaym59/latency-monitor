import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
}: {
  title?: string;
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <Card role="alert" className="flex items-start gap-3 border-danger/30 p-5">
      <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 break-words text-muted">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden />
          Retry
        </Button>
      )}
    </Card>
  );
}

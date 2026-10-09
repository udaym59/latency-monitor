import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      // 4xx won't fix itself; network blips and 5xx get two quick retries.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 2000),
    },
  },
});

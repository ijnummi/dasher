import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { pushError } from './errorLog'

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// SYNC: QueryClient config ↔ frontend/dashboard/src/main.tsx
// staleTime and retry must stay identical in both apps.
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => pushError(toMessage(error)),
  }),
  mutationCache: new MutationCache({
    onError: (error) => pushError(toMessage(error)),
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
})

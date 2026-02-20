// Shared QueryClient factory with sensible defaults to prevent caching issues
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from './toast-utils'

export interface CreateQueryClientOptions {
  /**
   * @deprecated No-op. Previously navigated to /500 on query errors, but this
   * prevented section-scoped error display. 5xx errors now show an inline
   * GeneralError within the section that owns the query. The /500 page is
   * still reachable via explicit throws in TanStack Router loaders. This field
   * will be removed in a future cleanup.
   */
  onServerError?: () => void
  onForbidden?: () => void
}

export function createQueryClient(options: CreateQueryClientOptions = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (import.meta.env.DEV) console.log({ failureCount, error })

          // Don't retry in dev
          if (failureCount >= 0 && import.meta.env.DEV) return false
          // Max 3 retries in prod
          if (failureCount > 3 && import.meta.env.PROD) return false

          // Don't retry auth errors
          return !(
            error instanceof AxiosError &&
            [401, 403, 404].includes(error.response?.status ?? 0)
          )
        },
        refetchOnWindowFocus: import.meta.env.PROD,
        // Don't cache data - always refetch to avoid stale auth states
        staleTime: 0,
        // Don't keep failed queries in cache
        gcTime: 1000 * 60, // 1 minute (reduced from default 5 minutes)
      },
      mutations: {
        onError: (error) => {
          if (error instanceof AxiosError) {
            if (error.response?.status === 304) {
              toast.error('Content not modified')
            }
          }
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 500) {
            toast.error('Internal server error')
          }
          if (error.response?.status === 403) {
            options.onForbidden?.()
          }
        }
      },
    }),
  })
}

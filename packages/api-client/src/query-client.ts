import { QueryClient, type QueryClientConfig } from '@tanstack/react-query'
import { cache } from 'react'

// 재시도는 ky에서 수행
export const config: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
}

let client: QueryClient | undefined

export const getQueryClient = cache(() => {
  if (typeof window === 'undefined') {
    return new QueryClient(config)
  }

  if (!client) {
    client = new QueryClient(config)
  }
  return client
})

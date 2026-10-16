export {
  customFetch,
  setAccessToken,
  getAccessToken,
  refresh as refreshAccessToken,
  ApiError,
} from './client'

export { AUTH_HINT_COOKIE, setAuthHint, clearAuthHint, readAuthHint } from './auth-hint'
export { useAuthHint } from './useAuthHint'

export { isApiError } from './errors'

export { requireRegisterAccessToken } from './register'

export { getQueryClient, config as queryClientConfig } from './query-client'

export {
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
export type { InfiniteData } from '@tanstack/react-query'
export { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Generated API hooks & types
export * from './generated/api'
export * from './generated/schemas'

export * from './labels'

export { postImageUrls } from './post'

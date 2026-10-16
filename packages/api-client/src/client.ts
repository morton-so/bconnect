import ky, { HTTPError } from 'ky'
import { setAuthHint, clearAuthHint } from './auth-hint'

const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    const apiUrl = process.env.API_URL
    if (!apiUrl) throw new Error('API_URL is required')
    return apiUrl
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is required')
  return apiUrl
}

let accessToken: string | null = null

export const getAccessToken = () => accessToken
export const setAccessToken = (token: string | null) => {
  accessToken = token
}

const REFRESH_EXEMPT_PATHS = ['/api/v1/auth/otp/send', '/api/v1/auth/otp/verify']

type ApiSuccessResponse<T> = {
  success: true
  data: T
}

type ApiErrorResponse = {
  success: false
  error: {
    code: string
    message: string
  }
}

const DEFAULT_ERROR_MESSAGE = '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const toApiError = (body: unknown, status?: number, name = 'UnknownError') => {
  const error = (body as Partial<ApiErrorResponse> | null | undefined)?.error
  return typeof error?.code === 'string' && typeof error.message === 'string'
    ? new ApiError(error.code, error.message, status)
    : new ApiError(name, DEFAULT_ERROR_MESSAGE, status)
}

// Promise로 토큰 중복 재발급 방지
let refreshPromise: Promise<boolean> | null = null

export function refresh(): Promise<boolean> {
  refreshPromise ??= ky
    .post(`${getBaseUrl()}/api/v1/auth/refresh`, { credentials: 'include' })
    .json<ApiSuccessResponse<{ accessToken: string }>>()
    .then(({ data }) => {
      setAccessToken(data.accessToken)
      setAuthHint()
      return true
    })
    .catch((error: unknown) => {
      if (error instanceof HTTPError && error.response.status === 401) {
        setAccessToken(null)
        clearAuthHint()
      }
      return false
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

const client = ky.create({
  prefix: getBaseUrl(),
  timeout: 30000,
  credentials: 'include',
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`)
        }
      },
    ],
    afterResponse: [
      async ({ request, response, retryCount }) => {
        const exempt = REFRESH_EXEMPT_PATHS.includes(new URL(request.url).pathname)
        if (response.status !== 401 || retryCount > 0 || exempt) return
        if (!(await refresh())) return
        const headers = new Headers(request.headers)
        headers.set('Authorization', `Bearer ${accessToken}`)
        return ky.retry({ request: new Request(request, { headers }), code: 'TOKEN_REFRESHED' })
      },
    ],
  },
})

/** 공통 응답 형식 제거, 에러 처리 */
export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await client(url, options)

    // 응답 없음
    const text = await response.text()
    if (!text) return null as T

    // 응답 있음
    const body = JSON.parse(text) as unknown
    if (body && typeof body === 'object' && 'success' in body) {
      return (body as ApiSuccessResponse<T>).data
    }
    // 공통 응답 형식을 제거한 mock 처리
    return body as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof HTTPError) {
      throw toApiError(error.data, error.response.status, error.name)
    }
    throw toApiError(undefined, undefined, error instanceof Error ? error.name : undefined)
  }
}

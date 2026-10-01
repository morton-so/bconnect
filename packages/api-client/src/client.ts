// ky: fetch wrapper — 우리는 prefix/timeout/credentials 같은 cross-cutting 옵션과
// hook (beforeRequest, afterResponse) 시스템 때문에 native fetch 대신 사용.
// orval 의 mutator (customFetch) 는 ky 인스턴스 (apiClient) 를 호출해 access token 주입과
// 401 → refresh → retry 자동 처리. 다른 후보 (axios, ofetch) 대비 ky 가 가장 가볍고
// hook API 가 명확함.
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

// Access Token 인메모리 저장
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

// 로그인 전(OTP)·refresh 자신의 401 은 재발급 재시도가 성립하지 않는 경로.
const AUTH_ENDPOINT = /\/auth\/(otp\/|refresh$)/
const isAuthEndpoint = (url: string) => AUTH_ENDPOINT.test(url)

type ApiSuccessResponse<T = never> = {
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

let refreshPromise: Promise<boolean> | null = null

// 토큰 중복 재발급 방지
export function refreshAccessToken(): Promise<boolean> {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

async function doRefresh(): Promise<boolean> {
  try {
    const response = await ky.post(`${getBaseUrl()}/api/v1/auth/refresh`, {
      credentials: 'include',
    })
    const json = (await response.json()) as
      ApiSuccessResponse<{ accessToken: string }> | ApiErrorResponse

    if (json.success) {
      setAccessToken(json.data.accessToken)
      setAuthHint()
      return true
    }
    clearAuthHint()
    return false
  } catch (error) {
    if (error instanceof HTTPError) {
      clearAuthHint()
    }
    return false
  }
}

export const apiClient = ky.create({
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
      async ({ request, options, response }) => {
        // 401 만 refresh 트리거 — 403 은 인가 실패(또는 BE 에러 dispatch 마스킹)라
        // refresh 로 해소되지 않는다.
        // auth 엔드포인트(로그인 전 OTP·refresh 자신)의 401 은 재발급이 성립하지 않는
        // 경로라 제외 — 오답마다 무의미한 /auth/refresh 가 따라붙는 낭비를 막는다.
        if (
          response.status === 401 &&
          !request.headers.get('X-Retry') &&
          !isAuthEndpoint(request.url)
        ) {
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            request.headers.set('Authorization', `Bearer ${accessToken}`)
            request.headers.set('X-Retry', '1')
            return ky(request, options)
          }
        }
        return response
      },
    ],
  },
})

/**
 * 런타임에서 ApiResponse envelope (`{ success, data }`) 을 벗기고 inner data 만
 * return + 401/403 retry + 모든 실패 → ApiError throw. spec 단계의 type 정렬은
 * `orval.transformer.ts` 가 담당.
 *
 * BE envelope 이 있으면 BE message 를, 없으면 `DEFAULT_ERROR_MESSAGE` 를 담는다.
 * 네트워크 단절·타임아웃·envelope 없는 HTTP 응답이 후자에 해당한다.
 */
export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  // ky prefix 는 join 경계의 slash 를 정규화하지만, orval URL 의 `/api/...` 를 미리 strip 해 둔다
  const normalizedUrl = url.startsWith('/') ? url.slice(1) : url

  try {
    const response = await apiClient(normalizedUrl, options)

    // 204 No Content 등 빈 응답은 envelope 없이 통과 (T = void 케이스)
    const text = await response.text()
    if (!text) return undefined as T

    const json = JSON.parse(text) as unknown
    // BE 는 envelope (`{success, data}`) 으로 응답, MSW mock 은 transformer 적용 후
    // inner data 만 wire 로 보내므로 두 wire format 모두 처리.
    if (json && typeof json === 'object' && 'success' in json) {
      const env = json as ApiSuccessResponse<T> | ApiErrorResponse
      if (!env.success) {
        throw new ApiError(env.error.code, env.error.message, response.status)
      }
      return env.data
    }
    return json as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof HTTPError) {
      const json = error.data as ApiErrorResponse | undefined
      if (json?.error)
        throw new ApiError(json.error.code, json.error.message, error.response.status)
      throw new ApiError(error.name, DEFAULT_ERROR_MESSAGE, error.response.status)
    }
    throw new ApiError((error as Error).name, DEFAULT_ERROR_MESSAGE)
  }
}

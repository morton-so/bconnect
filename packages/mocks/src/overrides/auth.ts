import { http, HttpResponse } from 'msw'
import { getSendOtpMockHandler, getLogoutMockHandler } from '@bconnect/api-client/msw'

const MOCK_OTP_CODE = '123456'
const REGISTERED_PHONE_PREFIX = '01099'

const verificationCodes = new Map<string, string>()

const generateToken = (label: string) => `mock_${label}_${Date.now()}`

export const authOverrides = [
  getSendOtpMockHandler(async ({ request }) => {
    const body = (await request.json()) as { phone?: string }
    if (body.phone) {
      verificationCodes.set(body.phone, MOCK_OTP_CODE)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MSW Auth] OTP sent to ${body.phone}: ${MOCK_OTP_CODE}`)
      }
    }
    return { expiresAt: new Date(Date.now() + 180000).toISOString() }
  }),

  http.post('*/api/v1/auth/otp/verify', async ({ request }) => {
    const body = (await request.json()) as { phone?: string; code?: string }
    if (!body.phone || !body.code) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'C001',
            status: 400,
            message: '유효하지 않은 입력값입니다',
            logLevel: 'WARN',
          },
        },
        { status: 400 }
      )
    }
    if (verificationCodes.get(body.phone) !== body.code) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'A003',
            status: 401,
            message: '유효하지 않은 인증번호입니다',
            logLevel: 'WARN',
          },
        },
        { status: 401 }
      )
    }
    verificationCodes.delete(body.phone)

    if (body.phone.startsWith(REGISTERED_PHONE_PREFIX)) {
      const accessToken = generateToken('access')
      const refreshToken = generateToken('refresh')
      return HttpResponse.json(
        {
          success: true,
          data: { registered: true, accessToken, refreshToken },
        },
        {
          headers: {
            'Set-Cookie': `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
          },
        }
      )
    }
    return HttpResponse.json({
      success: true,
      data: { registered: false, signupToken: generateToken('signup') },
    })
  }),

  http.post('*/api/v1/auth/refresh', () =>
    HttpResponse.json({
      success: true,
      data: {
        accessToken: generateToken('access'),
        refreshToken: generateToken('refresh'),
      },
    })
  ),

  getLogoutMockHandler(),
]

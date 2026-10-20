import { http, HttpResponse } from 'msw'
import {
  getCheckUsernameMockHandler,
  getCreateMemberMockHandler,
  getUpdateMyMemberPictureMockHandler,
} from '@bconnect/api-client/msw'
import type { RegisterMemberRequest, UpdatePictureRequest } from '@bconnect/api-client'
import { setMyMockPicture } from './profiles'

const TAKEN_USERNAMES = new Set(['admin', 'test', 'taken'])
const REGISTER_ERROR_BY_USERNAME = new Map([
  ['invalid-token', { code: 'A006', status: 400, message: '유효하지 않은 가입 토큰입니다.' }],
  ['expired-token', { code: 'A007', status: 400, message: '만료된 가입 토큰입니다.' }],
  ['taken-later', { code: 'M001', status: 409, message: '이미 사용 중인 사용자명입니다.' }],
  ['taken-phone', { code: 'M002', status: 409, message: '이미 사용 중인 전화번호입니다.' }],
])

export const membersOverrides = [
  getCheckUsernameMockHandler(({ request }) => {
    const username = new URL(request.url).searchParams.get('username')?.toLowerCase() ?? ''
    return { available: !TAKEN_USERNAMES.has(username) }
  }),
  http.post('*/api/v1/members', async ({ request }) => {
    const body = (await request.json()) as RegisterMemberRequest
    const registerError = REGISTER_ERROR_BY_USERNAME.get(body.username)
    if (!registerError) return

    return HttpResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: registerError.code,
          status: registerError.status,
          message: registerError.message,
          logLevel: 'INFO',
        },
      },
      { status: registerError.status }
    )
  }),
  getCreateMemberMockHandler(() => ({
    memberId: Math.floor(Math.random() * 1_000_000),
    accessToken: `mock_access_${Date.now()}`,
  })),
  getUpdateMyMemberPictureMockHandler(async ({ request }) => {
    const body = (await request.json()) as UpdatePictureRequest
    if (body.pictureId != null) setMyMockPicture(body.pictureId)
    return null
  }),
]

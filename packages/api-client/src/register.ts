import type { RegisterMemberResponse } from './generated/schemas'

/** TODO: BE 가 accessToken 을 required 로 바꾸면 여기만 지우면 된다. */
export function requireRegisterAccessToken(result: RegisterMemberResponse) {
  if (!result.accessToken) {
    throw new Error('회원가입 세션 토큰이 응답에 없습니다.')
  }

  return result.accessToken
}

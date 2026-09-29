import { ApiError } from './client'

/** API 에러 코드 분기처리 */
export const ERROR_CODE = {
  MEMBER: {
    DUPLICATE_USERNAME: 'M001',
    DUPLICATE_PHONE: 'M002',
  },
} as const

type Values<T> = T extends string ? T : { [K in keyof T]: Values<T[K]> }[keyof T]

export type ErrorCode = Values<typeof ERROR_CODE>

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** 선언된 에러 코드 중 하나인지 판별한다. */
export function hasErrorCode(error: unknown, ...codes: ErrorCode[]): error is ApiError {
  return isApiError(error) && codes.includes(error.code as ErrorCode)
}

/**
 * `POST /members`(회원 가입) 실패가 가입 토큰 문제인지 판별한다.
 *
 * 코드 조회가 아니라 계약 추론이라 카탈로그에 넣지 않는다 — 가입 경로의 400 은
 * A006(유효하지 않은 가입 토큰)·A007(만료된 가입 토큰) 뿐이고 중복은 409 다.
 * 그래서 코드를 보지 않고 status 로 판별한다.
 *
 * 반드시 register(`POST /members`) 호출을 감싼 catch 안에서만 쓴다. 제출 전체를
 * 감싸는 catch 에서 쓰면 프로필·업체 생성의 400 까지 토큰 오류로 오인해 OTP 로 되돌린다.
 */
export function isRegisterMemberSignupSessionError(error: unknown): error is ApiError {
  return isApiError(error) && error.status === 400
}

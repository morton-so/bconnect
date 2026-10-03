import { z } from 'zod'

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 30
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/

export function formatUsername(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase()
}

export const usernameField = z
  .string()
  .min(USERNAME_MIN_LENGTH, `최소 ${USERNAME_MIN_LENGTH}자 이상 입력해주세요.`)
  .max(USERNAME_MAX_LENGTH, `최대 ${USERNAME_MAX_LENGTH}자까지 입력 가능합니다.`)
  .regex(USERNAME_PATTERN, '숫자, 영어, 밑줄 및 마침표만 사용할 수 있습니다.')
  .transform((val) => val.toLowerCase())

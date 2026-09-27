/**
 * 사업자등록번호 (Korean Business Registration Number) 유틸.
 * - 형식: `xxx-xx-xxxxx` (10 digits)
 */
import { z } from 'zod'

/** 사업자등록번호 포맷팅 (xxx-xx-xxxxx). 10자리 초과 입력은 잘림. */
export function formatRegistrationNumber(value: string): string {
  const digits = extractDigits(value).slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

export function extractDigits(value: string): string {
  return value.replace(/\D/g, '')
}

// 사업자등록번호 10자리
export function isValidRegistrationNumber(value: string): boolean {
  return /^\d{10}$/.test(extractDigits(value))
}

export const registrationNumberSchema = z
  .string()
  .transform(extractDigits)
  .refine(isValidRegistrationNumber, {
    message: '올바른 사업자등록번호 형식이 아닙니다',
  })

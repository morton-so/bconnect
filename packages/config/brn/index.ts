/**
 * 사업자등록번호 (xxx-xx-xxxxx)
 */
import { z } from 'zod'

export function formatRegistrationNumber(value: string): string {
  const digits = extractDigits(value).slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

export function extractDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidRegistrationNumber(value: string): boolean {
  return /^\d{10}$/.test(extractDigits(value))
}

export const brnField = z.string().transform(extractDigits).refine(isValidRegistrationNumber, {
  message: '올바른 사업자등록번호 형식이 아닙니다',
})

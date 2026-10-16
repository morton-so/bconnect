/**
 * 사업자등록번호 (xxx-xx-xxxxx)
 */
import { z } from 'zod'
import { OneClickRequest } from '@bconnect/api-client/zod'
import { Regex } from './regex'

export function formatRegistrationNumber(value: string): string {
  const digits = extractDigits(value).slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

export function extractDigits(value: string): string {
  return value.replace(Regex.NON_DIGIT, '')
}

export const brnField = z.string().transform(extractDigits).pipe(OneClickRequest.shape.brn)

export function isValidRegistrationNumber(value: string): boolean {
  return brnField.safeParse(value).success
}

import parsePhoneNumber, {
  isValidPhoneNumber as isValidLibPhone,
  AsYouType,
} from 'libphonenumber-js'
import { z } from 'zod'

/** 국내 전화번호 형식 */
export function formatPhoneNumber(value: string): string {
  const parsed = value.startsWith('+') ? parsePhoneNumber(value) : undefined
  const isKoreanMobileE164 =
    parsed !== undefined &&
    parsed.country === 'KR' &&
    parsed.isValid() &&
    parsed.nationalNumber.length === 10 &&
    parsed.nationalNumber.startsWith('10')
  return new AsYouType('KR').input(isKoreanMobileE164 ? fromE164(value) : value)
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  return isValidLibPhone(phoneNumber, 'KR')
}

export const phoneField = z.string().refine(isValidPhoneNumber, '유효하지 않은 전화번호입니다.')

/** 한국 형식 → 국제 형식 */
export function toE164(phoneNumber: string): string {
  const parsed = parsePhoneNumber(phoneNumber, 'KR')
  if (!parsed) throw new Error('Invalid phone number')
  return parsed.format('E.164')
}

/** 국제 형식 → 한국 형식 */
export function fromE164(e164Phone: string): string {
  const parsed = parsePhoneNumber(e164Phone)
  if (!parsed) throw new Error('Invalid E.164 phone number')
  return parsed.formatNational()
}

/** 하이픈 제거 */
export function toNationalNumber(phoneNumber: string): string {
  const parsed = parsePhoneNumber(phoneNumber, 'KR')
  if (!parsed) throw new Error('Invalid phone number')
  return `0${parsed.nationalNumber}`
}

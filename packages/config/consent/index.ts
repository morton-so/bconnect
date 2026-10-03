import { z } from 'zod'
import { SITE_URL } from '../site'

export type ConsentKey = 'terms' | 'privacy' | 'age' | 'marketing'

export interface ConsentItem {
  key: ConsentKey
  label: string
  href?: string
}

/** 동의 항목 목록 */
export const CONSENT_ITEMS: ConsentItem[] = [
  { key: 'terms', label: '[필수] 이용약관 동의', href: `${SITE_URL.company}/terms` },
  { key: 'privacy', label: '[필수] 개인정보 수집·이용 동의', href: `${SITE_URL.company}/privacy` },
  { key: 'age', label: '[필수] 만 15세 이상입니다', href: undefined },
  {
    key: 'marketing',
    label: '[선택] 광고성 정보 수신 동의',
    href: `${SITE_URL.company}/marketing`,
  },
]

export const CONSENT_DEFAULT: Record<ConsentKey, boolean> = {
  terms: false,
  privacy: false,
  age: false,
  marketing: false,
}

export const consentField = z.object({
  terms: z.boolean().refine((v) => v, '이용약관에 동의해주세요.'),
  privacy: z.boolean().refine((v) => v, '개인정보 수집·이용에 동의해주세요.'),
  age: z.boolean().refine((v) => v, '만 15세 이상 여부를 확인해주세요.'),
  marketing: z.boolean(),
})

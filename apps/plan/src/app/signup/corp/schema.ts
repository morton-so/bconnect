import { z } from 'zod'
import { brnField } from '@bconnect/config/brn'
import { consentField } from '@bconnect/config/consent'

export const corpSchema = z.object({
  companyName: z
    .string()
    .min(1, '업체명을 입력해주세요.')
    .max(100, '업체명은 100자 이내로 입력해주세요.'),
  bizNumber: brnField,
  agreements: consentField,
})

export type CorpFormData = z.infer<typeof corpSchema>

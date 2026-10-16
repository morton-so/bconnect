import { z } from 'zod'
import { brnField } from '@bconnect/lib/brn'

export const CERTIFICATE_ACCEPT = ['application/pdf', 'image/jpeg', 'image/png']
export const CERTIFICATE_MAX_BYTES = 20 * 1024 * 1024

export const corpSchema = z.object({
  name: z.string().min(1, '업체명을 입력해주세요.').max(100, '업체명은 100자 이내로 입력해주세요.'),
  brn: brnField,
  certificate: z.custom<File>((v) => v instanceof File, '사업자등록증을 첨부해주세요.'),
})

export type CorpFormData = z.infer<typeof corpSchema>

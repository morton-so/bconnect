import { z } from 'zod'
import { CreateCompanyRequest } from '@bconnect/api-client/zod'
import { brnField } from '@bconnect/lib/brn'

export const CERTIFICATE_ACCEPT = ['application/pdf', 'image/jpeg', 'image/png']
export const CERTIFICATE_MAX_BYTES = 20 * 1024 * 1024

// TODO: 업데이트 필요
export const corpSchema = CreateCompanyRequest.omit({ attachmentId: true, pictureId: true }).extend(
  {
    brn: brnField,
    certificate: z.custom<File>((v) => v instanceof File, '사업자등록증을 첨부해주세요.'),
  }
)

export type CorpFormData = z.infer<typeof corpSchema>

import { z } from 'zod'
import type { FileValue } from '@bconnect/ui'
import { brnField } from '@bconnect/lib/brn'
import { nameField } from '@bconnect/lib/name'

export const oneClickSchema = z.object({
  brn: brnField,
  ownerName: nameField('대표자 성명'),
  openedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '개업일자를 YYYY-MM-DD 형식으로 입력해주세요')
    .refine((v) => !Number.isNaN(Date.parse(v)), '올바른 날짜가 아니에요'),
})

export type OneClickInput = z.input<typeof oneClickSchema>
export type OneClickOutput = z.output<typeof oneClickSchema>

export const credentialSchema = z.object({
  file: z.custom<FileValue | null>().refine((v) => v != null, '증명 파일을 첨부해주세요.'),
  note: z.string(),
})

export type CredentialFormInput = z.input<typeof credentialSchema>
export type CredentialFormValues = z.output<typeof credentialSchema>

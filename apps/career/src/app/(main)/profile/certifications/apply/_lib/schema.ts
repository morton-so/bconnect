import { z } from 'zod'
import { CreateCredentialRequest, ValidateBusinessRequest } from '@bconnect/api-client/zod'
import type { FileValue } from '@bconnect/ui'
import { brnField } from '@bconnect/lib/brn'

export const oneClickSchema = ValidateBusinessRequest.extend({
  brn: brnField,
  ownerName: z.string().trim().pipe(ValidateBusinessRequest.shape.ownerName),
})

export type OneClickInput = z.input<typeof oneClickSchema>
export type OneClickOutput = z.output<typeof oneClickSchema>

// TODO: 업데이트 필요
export const credentialSchema = CreateCredentialRequest.omit({
  type: true,
  expiredAt: true,
  attachmentId: true,
}).extend({
  file: z.custom<FileValue | null>(),
})

export type CredentialFormInput = z.input<typeof credentialSchema>
export type CredentialFormValues = z.output<typeof credentialSchema>

import { ValidateBusinessRequest } from '@bconnect/api-client/zod'
import { z } from 'zod'

export const ownerVerifySchema = ValidateBusinessRequest.extend({
  ownerName: z.string().trim().pipe(ValidateBusinessRequest.shape.ownerName),
})

export type OwnerVerifyValues = z.infer<typeof ownerVerifySchema>

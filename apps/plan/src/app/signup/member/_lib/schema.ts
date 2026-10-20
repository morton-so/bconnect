import { z } from 'zod'
import { RegisterMemberRequest } from '@bconnect/api-client/zod'
import { consentField } from '@bconnect/lib/consent'
import { birthField } from '@bconnect/lib/signup'
import { usernameField } from '@bconnect/lib/username'

// TODO: 업데이트 필요
export const memberSchema = RegisterMemberRequest.omit({ marketingConsent: true }).extend({
  username: usernameField,
  name: z.string().trim().pipe(RegisterMemberRequest.shape.name),
  birth: birthField,
  agreements: consentField,
})

export type MemberFormData = z.infer<typeof memberSchema>

import { RegisterMemberRequest } from '@bconnect/api-client/zod'
import { consentField } from '@bconnect/lib/consent'
import { birthField } from '@bconnect/lib/signup'
import { usernameField } from '@bconnect/lib/username'
import { z } from 'zod'

// TODO: 업데이트 필요
export const memberSchema = RegisterMemberRequest.omit({ marketingConsent: true }).extend({
  name: z.string().trim().pipe(RegisterMemberRequest.shape.name),
  birth: birthField,
  username: usernameField,
  agreements: consentField,
})

export type MemberFormData = z.infer<typeof memberSchema>

import { z } from 'zod'
import { consentField } from '@bconnect/lib/consent'
import { nameField } from '@bconnect/lib/name'
import { birthField } from '@bconnect/lib/signup'
import { usernameField } from '@bconnect/lib/username'

export const memberSchema = z.object({
  name: nameField(),
  birth: birthField,
  username: usernameField,
  agreements: consentField,
})

export type MemberFormData = z.infer<typeof memberSchema>

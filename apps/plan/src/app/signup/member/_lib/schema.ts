import { z } from 'zod'
import { consentField } from '@bconnect/lib/consent'
import { nameField } from '@bconnect/lib/name'
import { birthField } from '@bconnect/lib/signup'
import { usernameField } from '@bconnect/lib/username'

export const memberSchema = z.object({
  username: usernameField,
  name: nameField(),
  birth: birthField,
  agreements: consentField,
})

export type MemberFormData = z.infer<typeof memberSchema>

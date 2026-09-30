import { z } from 'zod'
import { consentField } from '@bconnect/config/consent'
import { nameField } from '@bconnect/config/name'
import { birthField } from '@bconnect/config/signup'
import { usernameField } from '@bconnect/config/username'

export const memberSchema = z.object({
  username: usernameField,
  name: nameField(),
  birth: birthField,
  agreements: consentField,
})

export type MemberFormData = z.infer<typeof memberSchema>

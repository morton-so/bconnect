import { z } from 'zod'
import { consentField } from '@bconnect/config/consent'
import { nameField } from '@bconnect/config/name'
import { usernameField } from '@bconnect/config/username'

export const memberSchema = z.object({
  username: usernameField,
  name: nameField(),
  agreements: consentField,
})

export type MemberFormData = z.infer<typeof memberSchema>

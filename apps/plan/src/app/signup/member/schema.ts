import { z } from 'zod'
import { nameField } from '@bconnect/config/name'
import { usernameField } from '@bconnect/config/username'

export const memberSchema = z.object({
  username: usernameField,
  name: nameField(),
})

export type MemberFormData = z.infer<typeof memberSchema>

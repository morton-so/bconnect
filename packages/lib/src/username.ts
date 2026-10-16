import { RegisterMemberRequest } from '@bconnect/api-client/zod'
import { Regex } from './regex'

export function formatUsername(value: string): string {
  return value.replace(Regex.NON_USERNAME, '').toLowerCase()
}

export const usernameField = RegisterMemberRequest.shape.username.toLowerCase()

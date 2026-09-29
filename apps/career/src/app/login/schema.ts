import { phoneField } from '@bconnect/config/phone'
import { z } from 'zod'

export const loginSchema = z.object({
  phone: phoneField,
  code: z.string().regex(/^\d{6}$/, '인증번호 6자리를 입력해주세요.'),
})

export type LoginFormData = z.infer<typeof loginSchema>

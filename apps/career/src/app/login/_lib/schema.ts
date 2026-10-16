import { VerifyCodeRequest } from '@bconnect/api-client/zod'
import type { z } from 'zod'

export const loginSchema = VerifyCodeRequest

export type LoginFormData = z.infer<typeof loginSchema>

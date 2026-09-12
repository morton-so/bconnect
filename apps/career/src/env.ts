import { z } from 'zod'
import { validateEnv, commonSchemas } from '@bconnect/config/env'

// fast-fail
const careerEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: commonSchemas.apiUrl,
  NEXT_PUBLIC_API_MOCKING: commonSchemas.apiMocking,
  NEXT_PUBLIC_GA_ID: commonSchemas.gaId,
})

export const env = validateEnv(careerEnvSchema)

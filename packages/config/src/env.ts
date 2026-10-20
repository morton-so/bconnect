import { z } from 'zod'

/** 공용 환경변수 스키마 */
export const commonSchemas = {
  apiUrl: z.string().url({
    message: 'Must be a valid URL',
  }),
  nodeEnv: z.enum(['development', 'production', 'test']),
  gaId: z
    .string()
    .regex(/^G-[A-Z0-9]+$/, { message: 'Must be a GA4 measurement ID (G-XXXXXXXXXX)' })
    .optional(),
}

/** 환경변수 검증 */
export function validateEnv<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  options?: { skipValidation?: boolean }
): z.infer<z.ZodObject<T>> {
  // 클라이언트, 빌드시 생략
  const isClient = typeof window !== 'undefined'
  const isBuildTime = process.env.npm_lifecycle_event === 'build'
  const skip = options?.skipValidation === true || isClient || isBuildTime

  if (skip) {
    if (!isClient) {
      console.warn('Environment variable validation skipped')
    }
    return process.env as unknown as z.infer<z.ZodObject<T>>
  }

  const parsed = schema.safeParse(process.env)

  if (!parsed.success) {
    console.error('Invalid environment variables:')
    console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2))
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

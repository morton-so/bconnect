import { CreateWorkerTaskRequest } from '@bconnect/api-client/zod'
import { addressField } from '@bconnect/lib/address'
import type { z } from 'zod'

// TODO: 업데이트 필요
export const createTaskSchema = CreateWorkerTaskRequest.omit({ address: true })
  .extend({ address: addressField('현장주소').nullish() })
  .refine((v) => v.start <= v.end, { message: '종료일은 시작일 이후여야 해요.', path: ['end'] })

export type CreateTaskValues = z.infer<typeof createTaskSchema>

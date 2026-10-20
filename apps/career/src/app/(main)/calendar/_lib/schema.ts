import { UpdateAssigneeTaskRequest, UpdateWorkerTaskRequest } from '@bconnect/api-client/zod'
import { addressField } from '@bconnect/lib/address'
import type { z } from 'zod'

export const assigneeEditSchema = UpdateAssigneeTaskRequest

// TODO: 업데이트 필요
export const workerEditSchema = UpdateWorkerTaskRequest.omit({ address: true })
  .extend({ address: addressField('현장주소').nullish() })
  .refine((v) => v.start <= v.end, { message: '종료일은 시작일 이후여야 해요.', path: ['end'] })

export type AssigneeEditValues = z.infer<typeof assigneeEditSchema>
export type WorkerEditValues = z.infer<typeof workerEditSchema>

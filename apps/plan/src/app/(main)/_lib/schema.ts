import { UpdateProjectTaskRequest } from '@bconnect/api-client/zod'
import type { z } from 'zod'

export const taskSchema = UpdateProjectTaskRequest.refine((v) => v.start <= v.end, {
  message: '종료일은 시작일 이후여야 해요.',
  path: ['end'],
})

export type TaskFormValues = z.infer<typeof taskSchema>

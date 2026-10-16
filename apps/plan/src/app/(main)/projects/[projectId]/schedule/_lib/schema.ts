import { UpdateProjectRequest } from '@bconnect/api-client/zod'
import type { z } from 'zod'

export const projectNameSchema = UpdateProjectRequest.pick({ title: true })
export type ProjectNameValues = z.infer<typeof projectNameSchema>

import { z } from 'zod'
import { CreatePostRequest } from '@bconnect/api-client/zod'
import type { WorkPhoto } from '../_components/PhotoStrip'

// TODO: 업데이트 필요
export const workSchema = CreatePostRequest.omit({ attachmentIds: true }).extend({
  taskId: CreatePostRequest.shape.taskId.unwrap().nullable(),
  photos: z.array(z.custom<WorkPhoto>()).min(1, '사진을 1장 이상 추가해주세요.'),
})
export type WorkFormValues = z.infer<typeof workSchema>

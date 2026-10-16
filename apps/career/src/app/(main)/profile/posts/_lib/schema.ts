import { z } from 'zod'
import type { WorkPhoto } from '../_components/PhotoStrip'

export const workSchema = z
  .object({
    taskId: z.number().nullable(),
    photos: z.array(z.custom<WorkPhoto>()).min(1, '사진을 1장 이상 추가해주세요.'),
    content: z.string().min(1, '상세 시공 설명을 입력해주세요.'),
  })
  .superRefine((v, ctx) => {
    if (v.taskId == null)
      ctx.addIssue({ code: 'custom', path: ['taskId'], message: '수행한 작업을 선택해주세요.' })
  })
export type WorkFormValues = z.infer<typeof workSchema>

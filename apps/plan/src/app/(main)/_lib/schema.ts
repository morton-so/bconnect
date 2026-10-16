import { TaskProgress, Trade } from '@bconnect/api-client'
import { z } from 'zod'

export const taskSchema = z
  .object({
    title: z.string().min(1, '작업명을 입력해주세요.'),
    start: z.string().min(1, '시작일을 선택해주세요.'),
    end: z.string().min(1, '종료일을 선택해주세요.'),
    trades: z.array(z.nativeEnum(Trade)).min(1, '공종을 1개 이상 선택해주세요.'),
    progress: z.nativeEnum(TaskProgress),
    requirement: z.string(),
    memo: z.string(),
  })
  .refine((v) => v.start <= v.end, {
    message: '종료일은 시작일 이후여야 해요.',
    path: ['end'],
  })

export type TaskFormValues = z.infer<typeof taskSchema>

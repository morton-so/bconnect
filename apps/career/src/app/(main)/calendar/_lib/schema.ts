import { TaskProgress, Trade } from '@bconnect/api-client'
import { addressField } from '@bconnect/config/address'
import { z } from 'zod'

export const assigneeEditSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  progress: z.nativeEnum(TaskProgress),
  memo: z.string(),
})

export const workerEditSchema = assigneeEditSchema
  .extend({
    company: z.string().min(1, '업체명을 입력해주세요.'),
    start: z.string().min(1, '시작일을 선택해주세요.'),
    end: z.string().min(1, '종료일을 선택해주세요.'),
    address: addressField('현장주소'),
    trades: z.array(z.nativeEnum(Trade)).min(1, '공종을 1개 이상 선택해주세요.'),
  })
  .superRefine((v, ctx) => {
    if (v.start > v.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '종료일은 시작일 이후여야 해요.',
        path: ['end'],
      })
    }
  })

export type AssigneeEditValues = z.infer<typeof assigneeEditSchema>
export type WorkerEditValues = z.infer<typeof workerEditSchema>

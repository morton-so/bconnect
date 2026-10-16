import { z } from 'zod'

export const projectNameSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '프로젝트명을 입력해주세요')
    .max(50, '프로젝트명은 50자 이내로 입력해주세요'),
})
export type ProjectNameValues = z.infer<typeof projectNameSchema>

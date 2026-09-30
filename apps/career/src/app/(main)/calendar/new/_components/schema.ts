import { Trade } from '@bconnect/api-client'
import { addressField } from '@bconnect/config/address'
import { z } from 'zod'

/**
 * 작업 생성 폼. career 캘린더는 worker task 계약(title/memo/company/address)을 사용한다.
 * request 는 별도 BE 필드가 없어 전송하지 않는다.
 */
export const createTaskSchema = z
  .object({
    title: z.string().min(1, '제목을 입력해주세요.'),
    company: z.string().min(1, '업체명을 입력해주세요.'),
    start: z.string().min(1, '시작일을 선택해주세요.'),
    end: z.string().min(1, '종료일을 선택해주세요.'),
    address: addressField('현장주소'),
    trades: z.array(z.nativeEnum(Trade)).min(1, '공종을 1개 이상 선택해주세요.'),
    memo: z.string(),
  })
  .refine((v) => v.start <= v.end, { message: '종료일은 시작일 이후여야 해요.', path: ['end'] })

export type CreateTaskValues = z.infer<typeof createTaskSchema>

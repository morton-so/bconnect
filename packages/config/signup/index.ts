import { z } from 'zod'
import { ageInYears, isCalendarDate } from '../date'

export const MIN_SIGNUP_AGE = 15

export const birthField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일 8자리를 입력해주세요.')
  .refine(isCalendarDate, '올바른 날짜가 아니에요.')
  .refine((v) => ageInYears(v) >= MIN_SIGNUP_AGE, `만 ${MIN_SIGNUP_AGE}세 미만은 가입할 수 없어요.`)

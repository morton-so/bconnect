import { RegisterMemberRequest } from '@bconnect/api-client/zod'
import { ageInYears } from './date'

export const MIN_SIGNUP_AGE = 15

export const birthField = RegisterMemberRequest.shape.birth.refine(
  (v) => ageInYears(v) >= MIN_SIGNUP_AGE,
  `만 ${MIN_SIGNUP_AGE}세 미만은 가입할 수 없어요.`
)

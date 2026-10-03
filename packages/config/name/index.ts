import { z } from 'zod'

export const nameField = (label = '이름') =>
  z
    .string()
    .trim()
    .min(1, `${label}을 입력해주세요.`)
    .max(50, `${label}은 50자 이내로 입력해주세요.`)

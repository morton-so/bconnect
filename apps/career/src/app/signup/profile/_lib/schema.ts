import { CreateProfileRequest } from '@bconnect/api-client/zod'
import { addressField } from '@bconnect/lib/address'
import type { z } from 'zod'

export const MAX_TRADES = 3

// TODO: 업데이트 필요
export const profileSchema = CreateProfileRequest.omit({ about: true }).extend({
  experience: CreateProfileRequest.shape.experience.unwrap(),
  address: addressField(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

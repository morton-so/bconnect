import { z } from 'zod'
import { UpdateProfileAboutRequest, UpdateProfileRequest } from '@bconnect/api-client/zod'
import { addressField } from '@bconnect/lib/address'

export const MAX_TRADES = 3

// TODO: 업데이트 필요
export const profileEditSchema = UpdateProfileRequest.omit({ role: true }).extend({
  experience: UpdateProfileRequest.shape.experience.unwrap(),
  about: UpdateProfileAboutRequest.shape.about,
  address: addressField(),
})

export type ProfileEditFormData = z.infer<typeof profileEditSchema>

import type { NotificationReferenceType } from '@bconnect/api-client'

export type PushReferenceType = Lowercase<NotificationReferenceType> | ''

export type PushData = {
  title: string
  body: string
  notification_id: string
  reference_type: PushReferenceType
  reference_id: string
}

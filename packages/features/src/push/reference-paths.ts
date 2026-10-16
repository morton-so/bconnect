import type { NotificationReferenceType } from '@bconnect/api-client'
import type { PushReferenceType } from './push-data'

export type ReferencePathMap = Partial<Record<NotificationReferenceType, string>>

export function resolveReferenceHref(
  map: ReferencePathMap,
  referenceType: NotificationReferenceType | PushReferenceType | null | undefined,
  referenceId: number | string | null | undefined
): string | undefined {
  const key = referenceType?.toUpperCase() as NotificationReferenceType | undefined
  const pattern = key ? map[key] : undefined
  if (!pattern) return undefined
  if (!pattern.includes('{id}')) return pattern
  if (referenceId == null || referenceId === '') return undefined
  return pattern.replaceAll('{id}', String(referenceId))
}

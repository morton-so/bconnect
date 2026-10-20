import { NotificationReferenceType } from '@bconnect/api-client'
import type { Notification } from '@bconnect/api-client'

export interface NotificationGroup {
  representative: Notification
  unreadIds: number[]
  count: number
}

const isChatRoom = (n: Notification) => n.referenceType === NotificationReferenceType.CHAT_ROOM

export function groupChatNotifications(notifications: Notification[]): NotificationGroup[] {
  const groups: NotificationGroup[] = []

  for (const n of notifications) {
    const prev = groups.at(-1)
    const mergeable =
      isChatRoom(n) &&
      n.referenceId != null &&
      prev != null &&
      isChatRoom(prev.representative) &&
      prev.representative.referenceId === n.referenceId

    if (mergeable) {
      if (n.id != null && !n.read) prev.unreadIds.push(n.id)
      prev.count += 1
    } else {
      groups.push({
        representative: n,
        unreadIds: n.id != null && !n.read ? [n.id] : [],
        count: 1,
      })
    }
  }

  return groups
}

'use client'

import { useGetDirectChats, useGetGroupChats, useAuthHint } from '@bconnect/api-client'
import { toChatSummaries } from './types'

/** TODO: unreadCount 가 optional emit 이라 누락 시 0 으로 fallback — BE required 처리 후 정확. */
export function useUnreadChatCount(): number {
  const enabled = useAuthHint()
  const dm = useGetDirectChats({ query: { enabled } })
  const group = useGetGroupChats({ query: { enabled } })
  return toChatSummaries(dm.data, group.data).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)
}

'use client'

import { useEffect, useRef } from 'react'
import { onMessage } from 'firebase/messaging'
import {
  getGetDirectChatsQueryKey,
  getGetGroupChatsQueryKey,
  getGetNotificationsQueryKey,
  getGetNotificationsUnreadCountQueryKey,
  readAuthHint,
  useQueryClient,
} from '@bconnect/api-client'
import { getFcmMessaging } from './firebase'
import { useNotificationStore } from './notification-store'
import { usePushStore } from './push-store'
import type { PushData } from './push-data'
import { resolveReferenceHref, type ReferencePathMap } from './reference-paths'
import { mapPermission, syncDeviceToken } from './request-push-permission'

export function usePushNotificationListener(referencePaths: ReferencePathMap): void {
  const initialized = useRef(false)
  const showNotification = useNotificationStore((s) => s.show)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (typeof window === 'undefined' || initialized.current) return
    initialized.current = true

    let unsubscribe: (() => void) | undefined

    async function setup() {
      const messaging = await getFcmMessaging()

      if (!messaging || !('Notification' in window)) {
        usePushStore.setState({ permissionStatus: 'unsupported', isSupported: false })
        return
      }

      usePushStore.setState({
        isSupported: true,
        permissionStatus: mapPermission(Notification.permission),
      })

      if (Notification.permission === 'granted' && readAuthHint()) await syncDeviceToken()

      unsubscribe = onMessage(messaging, (payload) => {
        const data = payload.data as Partial<PushData> | undefined
        const title = payload.notification?.title ?? payload.data?.title ?? '새 알림'
        const body = payload.notification?.body ?? payload.data?.body ?? ''
        const href = resolveReferenceHref(referencePaths, data?.reference_type, data?.reference_id)
        showNotification({ title, body, href })
        for (const queryKey of [
          getGetNotificationsUnreadCountQueryKey(),
          getGetNotificationsQueryKey(),
          getGetDirectChatsQueryKey(),
          getGetGroupChatsQueryKey(),
        ]) {
          queryClient.invalidateQueries({ queryKey })
        }
      })
    }

    setup()
    return () => unsubscribe?.()
  }, [showNotification, queryClient, referencePaths])
}

'use client'

import { getToken } from 'firebase/messaging'
import { getFcmMessaging } from './firebase'
import { registerDeviceToken, unregisterDeviceToken } from './register-device-token'
import { usePushStore, type PushPermissionStatus } from './push-store'

export function mapPermission(p: NotificationPermission): PushPermissionStatus {
  switch (p) {
    case 'granted':
      return 'granted'
    case 'denied':
      return 'denied'
    default:
      return 'prompt'
  }
}

async function fetchFcmToken(): Promise<string | null> {
  const messaging = await getFcmMessaging()
  if (!messaging) return null

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) {
    console.warn('[FCM] VAPID key 미설정 - 토큰 발급 불가')
    return null
  }

  try {
    return await getToken(messaging, { vapidKey })
  } catch (error) {
    console.error('[FCM] 토큰 발급 실패:', error)
    return null
  }
}

export async function syncDeviceToken(): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) {
    return
  }
  const token = await fetchFcmToken()
  if (!token) return
  usePushStore.setState({ token })
  await registerDeviceToken(token)
}

export async function revokeDeviceToken(): Promise<void> {
  const token = usePushStore.getState().token
  if (!token) return
  await unregisterDeviceToken(token)
  usePushStore.setState({ token: null })
}

export async function requestPushPermission(): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  const result = await Notification.requestPermission()
  usePushStore.setState({ permissionStatus: mapPermission(result) })

  if (result === 'granted') await syncDeviceToken()
}

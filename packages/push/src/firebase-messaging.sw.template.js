/* eslint-disable */
// @ts-nocheck
/* global importScripts, firebase, self */

/**
 * References
 * - https://firebase.google.com/docs/cloud-messaging/js/receive
 */

// Firebase Cloud Messaging Service Worker 템플릿
// `@bconnect/features/push/server` 에서 요청 시 `firebase-messaging-sw.js`로 치환

// ref에 따른 경로 매핑 (앱별 정의)
const REFERENCE_PATHS = __REFERENCE_PATH_MAP__

// href 파싱
function referenceHref(data) {
  const pattern = data?.reference_type
    ? REFERENCE_PATHS[String(data.reference_type).toUpperCase()]
    : undefined
  if (!pattern) return undefined
  if (!pattern.includes('{id}')) return pattern
  const id = data?.reference_id
  return id ? pattern.replaceAll('{id}', String(id)) : undefined
}

// 알림 딥링크 리다이렉트
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const href = referenceHref(event.notification.data)

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients[0]
      const target = new URL(href ?? '/', client ? client.url : self.location.origin).href
      if (client) return client.navigate(target).then(() => client.focus())
      return self.clients.openWindow(target)
    })
  )
})

importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js')

firebase.initializeApp(__FIREBASE_CONFIG__)

const messaging = firebase.messaging()

// OS 알림 표시
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? payload.data?.title ?? '새 알림'
  const options = {
    body: payload.notification?.body ?? payload.data?.body ?? '',
    icon: payload.notification?.icon ?? '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: payload.data,
  }
  self.registration.showNotification(title, options)
})

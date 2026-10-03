'use client'

import { initializeApp, getApp, type FirebaseApp, FirebaseError } from 'firebase/app'
import { getMessaging, type Messaging, isSupported } from 'firebase/messaging'

/** SSR 지연 초기화 */
let app: FirebaseApp | undefined

function getFirebaseApp(): FirebaseApp | undefined {
  if (typeof window === 'undefined') return undefined
  if (app) return app

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  const appId =
    process.env.NEXT_PUBLIC_CAREER_FIREBASE_APP_ID ?? process.env.NEXT_PUBLIC_PLAN_FIREBASE_APP_ID
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  // 필수 config 누락시 초기화 생략
  if (!apiKey || !authDomain || !projectId || !messagingSenderId || !appId) {
    console.warn('[FCM] env 누락:', {
      apiKey: !!apiKey,
      authDomain: !!authDomain,
      projectId: !!projectId,
      messagingSenderId: !!messagingSenderId,
      appId: !!appId,
    })
    return undefined
  }

  // 기본 이 이미 초기화돼 있으면 재사용
  app =
    getDefaultAppOrUndefined() ??
    initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    })

  return app
}

function getDefaultAppOrUndefined(): FirebaseApp | undefined {
  try {
    return getApp()
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'app/no-app') {
      // 기본 앱이 없으면 undefined 반환
      return undefined
    }
    throw error
  }
}

export async function getFcmMessaging(): Promise<Messaging | null> {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) {
    console.warn('[FCM] Firebase 앱 초기화 실패 (env 누락)')
    return null
  }

  const supported = await isSupported()
  if (!supported) {
    console.warn('[FCM] 브라우저 FCM 미지원 (isSupported=false)')
    return null
  }

  return getMessaging(firebaseApp)
}

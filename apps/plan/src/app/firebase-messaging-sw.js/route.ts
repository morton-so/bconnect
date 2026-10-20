/**
 * References
 * - https://firebase.google.com/docs/cloud-messaging/js/client
 * - https://nextjs.org/docs/app/api-reference/file-conventions/route
 * - https://nextjs.org/docs/app/guides/progressive-web-apps
 */
import { NextResponse } from 'next/server'
import { buildFcmServiceWorker } from '@bconnect/features/push/server'
import { REFERENCE_PATHS } from '@/lib/notification-routes'

export const dynamic = 'force-dynamic'

export async function GET() {
  const script = buildFcmServiceWorker(
    {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_PLAN_FIREBASE_APP_ID,
    },
    REFERENCE_PATHS
  )

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

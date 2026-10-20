import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { ReferencePathMap } from './reference-paths'

export interface FcmServiceWorkerConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// 런타임 주입 환경변수
export type FcmServiceWorkerInput = Record<keyof FcmServiceWorkerConfig, string | undefined>

const SW_TEMPLATE = readFileSync(
  fileURLToPath(new URL('./firebase-messaging.sw.template.js', import.meta.url)),
  'utf8'
)

export function buildFcmServiceWorker(
  config: FcmServiceWorkerInput,
  referencePaths: ReferencePathMap
): string {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  if (missing.length > 0) {
    throw new Error(`FCM 환경변수 누락: ${missing.join(', ')}`)
  }

  return SW_TEMPLATE.replaceAll('__FIREBASE_CONFIG__', JSON.stringify(config)).replaceAll(
    '__REFERENCE_PATH_MAP__',
    JSON.stringify(referencePaths)
  )
}

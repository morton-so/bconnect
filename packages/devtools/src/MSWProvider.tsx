'use client'

import { isApiMockingEnabled } from '@bconnect/config/env'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

let startPromise: Promise<unknown> | undefined

export function MSWProvider({ children }: { children: ReactNode }) {
  const enabled = isApiMockingEnabled()
  const [ready, setReady] = useState(!enabled)

  useEffect(() => {
    if (!enabled) return
    startPromise ??= import('@bconnect/mocks/browser').then(({ worker }) =>
      worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: { url: '/mockServiceWorker.js' },
      })
    )
    startPromise.catch((e) => console.error('[MSW] 초기화 실패', e)).finally(() => setReady(true))
  }, [enabled])

  return ready ? children : null
}

'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

// MSW 비활성화 옵션
const enabled = false

async function enableMocking() {
  const { worker } = await import('./browser')
  return worker.start()
}

let mocking: Promise<unknown> | undefined

export function MswProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!enabled)

  useEffect(() => {
    if (!enabled) return
    mocking ??= enableMocking().catch((e) => console.error('[MSW] 초기화 실패', e))
    mocking.then(() => setReady(true))
  }, [])

  return ready ? children : null
}

'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

// 로컬 개발 서버에서만 MSW 활성화
const enabled = process.env.NODE_ENV === 'development'

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

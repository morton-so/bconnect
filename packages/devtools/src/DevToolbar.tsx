'use client'

import dynamic from 'next/dynamic'
import type { AgentationProps } from 'agentation'

const AGENT_SYNC_ENDPOINT = 'http://localhost:4747'

const Agentation = dynamic<AgentationProps>(
  () =>
    import('agentation')
      .then((mod) => mod.Agentation)
      .catch((e) => {
        console.error('[Agentation] 로드 실패', e)
        return () => null
      }),
  { ssr: false }
)

export function DevToolbar() {
  return process.env.NODE_ENV === 'development' ? (
    <Agentation endpoint={AGENT_SYNC_ENDPOINT} />
  ) : null
}

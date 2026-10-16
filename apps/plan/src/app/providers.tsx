'use client'

import dynamic from 'next/dynamic'
import type { AgentationProps } from 'agentation'
import { QueryClientProvider, ReactQueryDevtools, getQueryClient } from '@bconnect/api-client'
import { Toaster } from '@bconnect/ui'
import type { ReactNode } from 'react'
import { MswProvider } from '@bconnect/mocks'
import { usePushNotificationListener, InAppNotification, PushToaster } from '@bconnect/features'
import { REFERENCE_PATHS } from '@/lib/notification-routes'

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

function AgentationBar() {
  return process.env.NODE_ENV === 'development' ? (
    <Agentation endpoint={AGENT_SYNC_ENDPOINT} />
  ) : null
}

// MswProvider → FCM 순서로 초기화
function PushBootstrap() {
  usePushNotificationListener(REFERENCE_PATHS)
  return <InAppNotification />
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <MswProvider>
      <QueryClientProvider client={queryClient}>
        <PushBootstrap />
        {children}
        <Toaster />
        <PushToaster />
        <ReactQueryDevtools initialIsOpen={false} />
        <AgentationBar />
      </QueryClientProvider>
    </MswProvider>
  )
}

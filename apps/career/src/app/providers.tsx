'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { AgentationProps } from 'agentation'
import {
  QueryClientProvider,
  ReactQueryDevtools,
  getQueryClient,
  refreshAccessToken,
  readAuthHint,
} from '@bconnect/api-client'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@bconnect/ui'
import type { ReactNode } from 'react'
import '../env'
import { MswProvider } from '@bconnect/mocks'
import { usePushNotificationListener, InAppNotification } from '@bconnect/features'
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
function PostMSWBootstrap({ children }: { children: ReactNode }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    if (readAuthHint()) refreshAccessToken()
  }, [])

  usePushNotificationListener(REFERENCE_PATHS)

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <MswProvider>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <PostMSWBootstrap>
            <InAppNotification />
            {children}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
            <AgentationBar />
          </PostMSWBootstrap>
        </QueryClientProvider>
      </NuqsAdapter>
    </MswProvider>
  )
}

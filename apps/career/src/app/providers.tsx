'use client'

import { useEffect, useRef } from 'react'
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
import { MSWProvider, DevToolbar } from '@bconnect/devtools'
import { usePushNotificationListener, InAppNotification } from '@bconnect/push'
import { REFERENCE_PATHS } from '@/lib/notification-routes'

// MSWProvider → FCM 순서로 초기화
function PostMSWBootstrap({ children }: { children: ReactNode }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    // 로그아웃 상태면 스킵 — 선제 refresh 가 게스트 방문마다 401 을 만든다.
    // 힌트가 있는데 세션이 무효면 refresh 실패가 힌트 쿠키를 스스로 지운다 (client.ts).
    if (readAuthHint()) refreshAccessToken()
  }, [])

  usePushNotificationListener(REFERENCE_PATHS)

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <MSWProvider>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <PostMSWBootstrap>
            <InAppNotification />
            {children}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
            <DevToolbar />
          </PostMSWBootstrap>
        </QueryClientProvider>
      </NuqsAdapter>
    </MSWProvider>
  )
}

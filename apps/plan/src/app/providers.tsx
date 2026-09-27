'use client'

import { QueryClientProvider, ReactQueryDevtools, getQueryClient } from '@bconnect/api-client'
import { Toaster } from '@bconnect/ui'
import type { ReactNode } from 'react'
import { MSWProvider, DevToolbar } from '@bconnect/devtools'
import { usePushNotificationListener, InAppNotification, PushToaster } from '@bconnect/push'
import { REFERENCE_PATHS } from '@/lib/notification-routes'

// MSWProvider → FCM 순서로 초기화
function PushBootstrap() {
  usePushNotificationListener(REFERENCE_PATHS)
  return <InAppNotification />
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <MSWProvider>
      <QueryClientProvider client={queryClient}>
        <PushBootstrap />
        {children}
        <Toaster />
        <PushToaster />
        <ReactQueryDevtools initialIsOpen={false} />
        <DevToolbar />
      </QueryClientProvider>
    </MSWProvider>
  )
}

'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { GuestSidebar } from './_components/GuestSidebar'
import { LoginGateProvider } from './_components/LoginGateProvider'
import { MemberSidebar } from './_components/MemberSidebar'
import { PanelHost } from './_components/panel/PanelHost'
import { useAuthHint } from '@bconnect/api-client'
import { AccessGuard, NotificationPromptToast } from '@bconnect/features'
import { useTechnicianItems } from '@/hooks/useTechnicianItems'
import { isPublicPath } from '@/lib/public-routes'

function GuestSidebarWithCount() {
  const { memberCount } = useTechnicianItems()
  return <GuestSidebar memberCount={memberCount} />
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthHint()
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="flex h-full w-[270px] shrink-0 flex-col border-r border-gray-300">
        {isAuthenticated ? (
          <MemberSidebar />
        ) : (
          <Suspense fallback={<GuestSidebar memberCount={0} />}>
            <GuestSidebarWithCount />
          </Suspense>
        )}
      </aside>
      <LoginGateProvider>
        <AccessGuard
          allowed={['PLAN']}
          roleFallback="/signup/corp"
          loginFallback={isPublicPath(pathname) ? undefined : '/login'}
        >
          <main className="flex h-full min-w-0 flex-1 [scrollbar-width:none] justify-start overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <div className="flex min-h-full w-full flex-col">{children}</div>
          </main>
          <Suspense>
            <PanelHost />
          </Suspense>
        </AccessGuard>
      </LoginGateProvider>
      <NotificationPromptToast />
    </div>
  )
}

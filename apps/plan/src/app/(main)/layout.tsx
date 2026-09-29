'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { GuestSidebar } from './_components/GuestSidebar'
import { LoginGateProvider } from './_components/LoginGateProvider'
import { MemberSidebar } from './_components/MemberSidebar'
import { PanelHost } from './_components/panel/PanelHost'
import { useAuthHint } from '@bconnect/api-client'
import { AccessGuard } from '@bconnect/features'
import { NotificationPromptToast } from '@bconnect/push'
import { useTechnicianItems } from '@/hooks/useTechnicianItems'
import { isPublicPath } from '@/lib/public-routes'

function GuestSidebarWithCount() {
  // '검증된 프로필' 카피라 가입 회원 수만 — 크롤링(미검증) 프로필은 제외
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

'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { BottomNavigation } from './_components/BottomNavigation'
import { MainContent } from './_components/MainContent'
import { NotificationPrompt } from '@bconnect/push'
import { AccessGuard } from '@bconnect/features'
import { isPublicPath } from '@/lib/public-routes'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    // min-h-screen(=100vh) 은 모바일에서 주소창이 보여도 주소창 숨김 기준 높이(lvh)로 잡혀
    // 채팅방(h-dvh) 아래에 빈 띠가 남는다. 실제 보이는 높이를 따라가도록 dvh 사용.
    <div className="mx-auto min-h-dvh max-w-screen-sm bg-white">
      <Suspense>
        <MainContent>
          <AccessGuard
            allowed={['CAREER']}
            roleFallback="/signup/profile"
            loginFallback={isPublicPath(pathname) ? undefined : '/login'}
          >
            {children}
          </AccessGuard>
        </MainContent>
      </Suspense>
      <BottomNavigation />
      <NotificationPrompt />
    </div>
  )
}

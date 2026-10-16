'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { BottomNavShell } from './_components/BottomNavShell'
import { NotificationPrompt } from '@bconnect/push'
import { AccessGuard } from '@bconnect/features'
import { isPublicPath } from '@/lib/public-routes'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto min-h-dvh max-w-screen-sm bg-white">
      <Suspense>
        <BottomNavShell>
          <AccessGuard
            allowed={['CAREER']}
            roleFallback="/signup/profile"
            loginFallback={isPublicPath(pathname) ? undefined : '/login'}
          >
            {children}
          </AccessGuard>
        </BottomNavShell>
      </Suspense>
      <NotificationPrompt />
    </div>
  )
}

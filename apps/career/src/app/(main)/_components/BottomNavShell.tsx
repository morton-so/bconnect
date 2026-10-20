'use client'

import { usePathname } from 'next/navigation'
import { BottomNavigation } from './BottomNavigation'

const NAV_HIDDEN_ROUTES = [
  /^\/messages(\/|$)/,
  /^\/profile\/edit(\/|$)/,
  /^\/profile\/about\/edit(\/|$)/,
  /^\/calendar\/new(\/|$)/,
  /^\/storage\/.+/,
]

export function BottomNavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isNavHidden = NAV_HIDDEN_ROUTES.some((route) => route.test(pathname))
  const isChatRoom = /^\/messages\/\d+/.test(pathname)

  const className = isChatRoom
    ? 'flex h-dvh flex-col overflow-hidden'
    : isNavHidden
      ? ''
      : 'pb-[70px]'

  return (
    <>
      <main className={className}>{children}</main>
      {!isNavHidden && <BottomNavigation />}
    </>
  )
}

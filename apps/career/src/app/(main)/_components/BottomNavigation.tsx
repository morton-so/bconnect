'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, HomeIcon, JobsIcon, DriveIcon, CalendarIcon, ProfileIcon } from '@bconnect/ui'

interface NavItem {
  href: string
  label: string
  icon: React.FC<{ active: boolean }>
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: '홈', icon: HomeIcon },
  { href: '/jobs', label: '공고', icon: JobsIcon, disabled: true },
  { href: '/storage', label: '저장소', icon: DriveIcon },
  { href: '/calendar', label: '캘린더', icon: CalendarIcon },
  { href: '/profile', label: '내 정보', icon: ProfileIcon },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-300 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-[70px] max-w-screen-sm items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon, disabled }) => {
          const isActive =
            !disabled && (href === '/' ? pathname === '/' : pathname.startsWith(href))

          if (disabled) {
            return (
              <span
                key={href}
                className="flex w-11 cursor-not-allowed flex-col items-center gap-1 text-gray-500 opacity-40"
              >
                <Icon active={false} />
                <span className="text-m-12">{label}</span>
              </span>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex w-11 flex-col items-center gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-gray-500'
              )}
            >
              <Icon active={isActive} />
              <span className={isActive ? 'text-sb-12' : 'text-m-12'}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

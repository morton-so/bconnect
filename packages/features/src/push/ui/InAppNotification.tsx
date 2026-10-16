'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotificationStore } from '../notification-store'

const AUTO_DISMISS_MS = 4000

export function InAppNotification() {
  const router = useRouter()
  const current = useNotificationStore((s) => s.current)
  const dismiss = useNotificationStore((s) => s.dismiss)

  useEffect(() => {
    if (!current) return
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [current, dismiss])

  if (!current) return null

  const handleClick = () => {
    if (current.href) router.push(current.href)
    dismiss()
  }

  return (
    <div role="alert" className="fixed top-0 right-0 left-0 z-50" onClick={handleClick}>
      <div className="mx-4 mt-[env(safe-area-inset-top,12px)] rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
        <p className="truncate text-sb-14 text-gray-900">{current.title}</p>
        <p className="mt-0.5 truncate text-r-12 text-gray-500">{current.body}</p>
      </div>
    </div>
  )
}

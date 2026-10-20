'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type PanelSegment =
  | `profile/${number}`
  | `profile/${number}/coworkers`
  | `profile/${number}/recommendations`
  | `crawled/${number}`
  | 'messages'
  | `messages/${number}`
  | 'notifications'
  | `task/${string}`

export function usePanelNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hrefWithPanel = (panelValue: string | null, extra?: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (panelValue) params.set('panel', panelValue)
    else params.delete('panel')
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        if (value === null) params.delete(key)
        else params.set(key, value)
      }
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const closeHref = hrefWithPanel(null)

  return {
    /** 현재 열린 패널 세그먼트 (`?panel=` 값 그대로, 없으면 null). 사이드바 active 표시 등 읽기용. */
    panel: searchParams.get('panel'),
    panelHref: (segment: PanelSegment, extra?: Record<string, string | null>) =>
      hrefWithPanel(segment, extra),
    openPanel: (segment: PanelSegment, extra?: Record<string, string | null>) =>
      router.push(hrefWithPanel(segment, extra), { scroll: false }),
    closeHref,
    close: () => router.push(closeHref, { scroll: false }),
  }
}

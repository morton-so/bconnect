'use client'

import { toast } from '@bconnect/ui'
import { useCallback } from 'react'

/** URL 복사 & 토스트 */
export function useShareCurrentUrl(options?: { getUrl?: () => string }) {
  const getUrl = options?.getUrl

  return useCallback(async () => {
    const shareData = { title: document.title, url: getUrl?.() ?? window.location.href }
    if (navigator.canShare?.(shareData)) {
      await navigator.share(shareData)
      return
    }
    await navigator.clipboard.writeText(shareData.url)
    toast({ description: '링크가 복사되었어요', variant: 'success' })
  }, [getUrl])
}

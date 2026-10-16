'use client'

import { useCallback } from 'react'

export function useScrollToError({
  behavior = 'smooth',
  block = 'center',
}: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition } = {}): () => void {
  return useCallback(() => {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')
      if (!el) return
      el.scrollIntoView({ behavior, block })
      el.focus({ preventScroll: true })
    })
  }, [behavior, block])
}

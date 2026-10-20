'use client'

import { useCallback, useEffect, useState } from 'react'

export interface UnsavedGuard {
  confirmOpen: boolean
  setConfirmOpen: (open: boolean) => void
  requestClose: (proceed: () => void) => void
  confirmProceed: () => void
}

/** 편집 중 이탈 경고 TODO: Link, PanelTask */
export function useUnsavedGuard(dirty: boolean): UnsavedGuard {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState<{ run: () => void } | null>(null)

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const requestClose = useCallback(
    (proceed: () => void) => {
      if (dirty) {
        setPending({ run: proceed })
        setConfirmOpen(true)
      } else {
        proceed()
      }
    },
    [dirty]
  )

  const confirmProceed = useCallback(() => {
    setConfirmOpen(false)
    pending?.run()
    setPending(null)
  }, [pending])

  return { confirmOpen, setConfirmOpen, requestClose, confirmProceed }
}

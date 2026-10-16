'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePushStore } from './push-store'
import { requestPushPermission } from './request-push-permission'

const SUPPRESS_KEY = 'bconnect:notif-softask-suppressed-until'
const SESSION_KEY = 'bconnect:notif-softask-shown'
const SUPPRESS_DAYS = 7

function isSuppressed(): boolean {
  if (typeof window === 'undefined') return true
  return Date.now() < Number(localStorage.getItem(SUPPRESS_KEY) ?? 0)
}

function shownThisSession(): boolean {
  if (typeof window === 'undefined') return true
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function useNotificationSoftAsk() {
  const permissionStatus = usePushStore((s) => s.permissionStatus)
  const isSupported = usePushStore((s) => s.isSupported)
  const [decided, setDecided] = useState(false)

  const [gate] = useState(() => !isSuppressed() && !shownThisSession())

  const open = isSupported && permissionStatus === 'prompt' && !decided && gate

  useEffect(() => {
    if (open) sessionStorage.setItem(SESSION_KEY, '1')
  }, [open])

  const accept = useCallback(async () => {
    setDecided(true)
    await requestPushPermission()
  }, [])

  const dismiss = useCallback(() => {
    setDecided(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUPPRESS_KEY, String(Date.now() + SUPPRESS_DAYS * 24 * 60 * 60 * 1000))
    }
  }, [])

  return { open, accept, dismiss }
}

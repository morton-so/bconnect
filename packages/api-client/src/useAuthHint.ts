'use client'

import { useSyncExternalStore } from 'react'
import { readAuthHint, subscribeAuthHint } from './auth-hint'

export function useAuthHint(): boolean {
  return useSyncExternalStore(subscribeAuthHint, readAuthHint, () => false)
}

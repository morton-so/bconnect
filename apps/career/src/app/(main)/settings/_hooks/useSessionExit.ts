'use client'

import { revokeDeviceToken } from '@bconnect/push'
import { logout } from '@bconnect/features'

interface SessionExitOptions {
  clearAuthOnFailure?: boolean
}

export function useSessionExit() {
  return async (
    serverCall: () => Promise<unknown>,
    { clearAuthOnFailure = false }: SessionExitOptions = {}
  ): Promise<void> => {
    await revokeDeviceToken()
    try {
      await serverCall()
    } catch (error) {
      if (clearAuthOnFailure) logout()
      throw error
    }
    logout()
  }
}

import { setAccessToken, setAuthHint, clearAuthHint, getQueryClient } from '@bconnect/api-client'
import { syncDeviceToken } from './push'

export function login(accessToken: string) {
  setAccessToken(accessToken)
  setAuthHint()
  syncDeviceToken()
}

export function logout() {
  setAccessToken(null)
  clearAuthHint()
  getQueryClient().clear()
}

export const AUTH_HINT_COOKIE = 'bc_auth_hint'

const AUTH_HINT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const cookieAttributes = () => {
  const { hostname } = window.location
  const domain =
    hostname === 'bconnect.to' || hostname.endsWith('.bconnect.to') ? '; Domain=.bconnect.to' : ''
  return `Path=/; SameSite=Lax; Secure${domain}`
}

const listeners = new Set<() => void>()

export function subscribeAuthHint(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const notify = () => {
  for (const listener of listeners) listener()
}

export function setAuthHint() {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_HINT_COOKIE}=${Date.now()}; Max-Age=${AUTH_HINT_MAX_AGE_SECONDS}; ${cookieAttributes()}`
  notify()
}

export function clearAuthHint() {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_HINT_COOKIE}=; Max-Age=0; ${cookieAttributes()}`
  notify()
}

export function readAuthHint(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').some((c) => c.startsWith(`${AUTH_HINT_COOKIE}=`))
}

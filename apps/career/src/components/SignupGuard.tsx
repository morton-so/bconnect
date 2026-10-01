'use client'

import { isApiError, readAuthHint, useGetMyMember } from '@bconnect/api-client'
import { useSignupStore } from '@/stores/signup-store'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useSyncExternalStore, type ReactNode } from 'react'

export function SignupGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { formData } = useSignupStore()
  const hasAuthHint = readAuthHint()
  const hydrated = useSyncExternalStore(
    (onChange) => useSignupStore.persist.onFinishHydration(onChange),
    () => useSignupStore.persist.hasHydrated(),
    () => false
  )
  const checksRole = hydrated && hasAuthHint
  const { data: me, error, isPending } = useGetMyMember({ query: { enabled: checksRole } })
  const isLoggedIn = hasAuthHint && !(isApiError(error) && error.status === 401)

  const redirectTo = (() => {
    if (!hydrated) return null
    if (isLoggedIn) {
      if (isPending) return null
      const hasRole = me?.roles.includes('CAREER') ?? false
      if (hasRole && pathname === '/signup/complete') return null
      const target = hasRole ? '/' : '/signup/profile'
      return pathname === target ? null : target
    }
    if (pathname === '/login' || pathname === '/signup/complete') return null
    if (pathname === '/signup/profile' || !formData.signupToken) return '/login'
    return null
  })()

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo)
  }, [redirectTo, router])

  // 리다이렉트 직전 렌더링 생략
  if (redirectTo || (checksRole && isPending)) return null

  return children
}

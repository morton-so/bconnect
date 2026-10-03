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
    // 로그인시 PLAN 권한이 있으면 루트, 없거나 조회에 실패하면 업체 생성 페이지로 이동
    if (isLoggedIn) {
      if (isPending) return null
      const target = me?.roles.includes('PLAN') ? '/' : '/signup/corp'
      return pathname === target ? null : target
    }
    if (pathname === '/login') return null
    // 비로그인 업체 생성 진입 또는 가입 토큰이 없는 경우 로그인 페이지로 이동
    if (pathname === '/signup/corp' || !formData.signupToken) return '/login'
    return null
  })()

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo)
  }, [redirectTo, router])

  if (redirectTo || (checksRole && isPending)) return null

  return children
}

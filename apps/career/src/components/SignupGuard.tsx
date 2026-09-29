'use client'

import { isApiError, readAuthHint, useGetMyMember } from '@bconnect/api-client'
import { useSignupStore } from '@/stores/signup-store'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useSyncExternalStore, type ReactNode } from 'react'

/**
 * 가입 단계 가드 — 앞 단계를 건너뛴 진입을 그 단계로 되돌린다.
 *
 * 주소를 직접 치거나 새로고침해도 빈 가입 토큰으로 제출되는 일이 없어야 한다.
 * 페이지마다 흩어 두지 않고 signup layout 한 곳에서만 판정한다.
 *
 * 저장소 복원이 끝나기 전에는 판정하지 않는다. persist 는 첫 렌더 뒤에 값을 채우므로,
 * 그때 판정하면 새로고침한 사용자가 저장된 가입 토큰을 두고도 인증 단계로 튕긴다.
 */
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

  // 이동이 확정된 렌더에서는 본문을 그리지 않는다 — 잘못된 단계 화면이 한 프레임 보이는 것 방지.
  if (redirectTo || (checksRole && isPending)) return null

  return children
}

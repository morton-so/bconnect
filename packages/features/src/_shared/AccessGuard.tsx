'use client'

import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { isApiError, useAuthHint, useGetMyMember, type Role } from '@bconnect/api-client'

interface AccessGuardProps {
  allowed: Role[] // 허용 권한
  roleFallback: string // 리다이렉트 경로
  loginFallback?: string
  children: ReactNode
}

export function AccessGuard({ allowed, roleFallback, loginFallback, children }: AccessGuardProps) {
  const enabled = useAuthHint()
  const { data, error } = useGetMyMember({ query: { enabled } })

  if (isApiError(error) && error.status === 401) {
    if (loginFallback) redirect(loginFallback)
  } else if (error || (data && !data.roles.some((role) => allowed.includes(role)))) {
    redirect(roleFallback)
  }
  return <>{children}</>
}

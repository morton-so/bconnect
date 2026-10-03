import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { AccessGuard } from '@bconnect/features'

const isProdDeploy = (process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV) === 'production'

export const metadata: Metadata = { title: '인스타그램 업로드' }

export default function InstagramLayout({ children }: { children: ReactNode }) {
  if (isProdDeploy) notFound()
  return (
    <AccessGuard allowed={['CAREER']} roleFallback="/signup/profile" loginFallback="/login">
      {children}
    </AccessGuard>
  )
}

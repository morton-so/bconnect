import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AccessGuard } from '@bconnect/features'

export const metadata: Metadata = { title: '인스타그램 업로드' }

export default function InstagramLayout({ children }: { children: ReactNode }) {
  return (
    <AccessGuard allowed={['CAREER']} roleFallback="/signup/profile" loginFallback="/login">
      {children}
    </AccessGuard>
  )
}

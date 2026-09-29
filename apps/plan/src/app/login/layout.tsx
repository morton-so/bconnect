import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SignupGuard } from '@/components/SignupGuard'

export const metadata: Metadata = { title: '로그인' }

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <SignupGuard>{children}</SignupGuard>
}

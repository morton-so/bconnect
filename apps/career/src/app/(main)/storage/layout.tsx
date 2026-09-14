import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

const isProdDeploy = (process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV) === 'production'

export const metadata: Metadata = { title: '공유 저장소' }

export default function StorageLayout({ children }: { children: ReactNode }) {
  if (isProdDeploy) notFound()
  return children
}

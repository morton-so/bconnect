import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: '공유 저장소' }

export default function StorageLayout({ children }: { children: ReactNode }) {
  return children
}

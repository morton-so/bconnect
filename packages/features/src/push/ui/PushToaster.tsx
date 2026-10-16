'use client'

import { Toaster } from 'sonner'

/** TODO: 기존 radix Toaster 와 일시 공존 — 전역 radix→sonner 마이그레이션은 별도 PR */
export function PushToaster() {
  return <Toaster position="bottom-right" theme="light" />
}

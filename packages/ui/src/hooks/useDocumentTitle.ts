'use client'

import { useEffect } from 'react'
import { SERVICE_NAME } from '@bconnect/config/site'

/** CSR 시점에 document.title 업데이트 */
export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    if (!title) return
    const prev = document.title
    document.title = `${title} | ${SERVICE_NAME}`
    return () => {
      document.title = prev
    }
  }, [title])
}

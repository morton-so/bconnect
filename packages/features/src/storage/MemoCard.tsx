import type { ReactNode } from 'react'
import { formatKoreanDate } from '@bconnect/lib/date'
import type { Memo } from './types'

export interface MemoCardProps {
  memo: Memo
  renderKebab?: (memo: Memo) => ReactNode
}

export function MemoCard({ memo, renderKebab }: MemoCardProps) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-gray-400">{formatKoreanDate(memo.createdAt)}</span>
        {renderKebab?.(memo)}
      </div>
      <p className="mt-2 text-sm whitespace-pre-line text-gray-900">{memo.content}</p>
    </div>
  )
}

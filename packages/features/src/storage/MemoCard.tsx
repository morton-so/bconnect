import type { ReactNode } from 'react'
import type { Memo } from './types'

export interface MemoCardProps {
  memo: Memo
  renderKebab?: (memo: Memo) => ReactNode
}

function formatMemoDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function MemoCard({ memo, renderKebab }: MemoCardProps) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-gray-400">{formatMemoDate(memo.createdAt)}</span>
        {renderKebab?.(memo)}
      </div>
      <p className="mt-2 text-sm whitespace-pre-line text-gray-900">{memo.content}</p>
    </div>
  )
}

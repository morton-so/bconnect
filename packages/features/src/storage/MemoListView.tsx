'use client'

import { useState, type ReactNode } from 'react'
import { ConfirmDialog, useUnsavedGuard } from '@bconnect/ui'
import { MemoCard } from './MemoCard'
import { MemoEditor } from './MemoEditor'
import type { Memo } from './types'

export interface MemoListViewProps {
  memos: Memo[]
  isLoading: boolean
  isError: boolean
  canManage?: boolean
  onCreate?: (content: string) => void
  onUpdate?: (id: string, content: string) => void
  onDelete?: (id: string) => void
  composing?: boolean
  onComposingChange?: (composing: boolean) => void
  confirmDelete?: (onConfirm: () => void) => void
  renderKebab?: (memo: Memo, actions: { edit: () => void; remove: () => void }) => ReactNode
  emptyLabel?: string
}

export function MemoListView({
  memos,
  isLoading,
  isError,
  canManage,
  onCreate,
  onUpdate,
  onDelete,
  composing,
  onComposingChange,
  confirmDelete,
  renderKebab,
  emptyLabel = '메모가 없습니다',
}: MemoListViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const guard = useUnsavedGuard(dirty)

  const closeEdit = () => {
    setEditingId(null)
    setDirty(false)
  }
  const closeCompose = () => {
    onComposingChange?.(false)
    setDirty(false)
  }
  const requestCancelEdit = () => guard.requestClose(closeEdit)
  const requestCancelCompose = () => guard.requestClose(closeCompose)
  const startEdit = (id: string) => {
    setEditingId(id)
    setDirty(false)
  }
  const requestDelete = (id: string) => {
    const run = () => onDelete?.(id)
    if (confirmDelete) confirmDelete(run)
    else run()
  }

  if (isLoading) {
    return <p className="px-1 py-8 text-center text-sm text-gray-500">불러오는 중…</p>
  }
  if (isError) {
    return <p className="px-1 py-8 text-center text-sm text-gray-500">메모를 불러올 수 없습니다</p>
  }

  const isEmpty = memos.length === 0 && !composing

  return (
    <div className="flex flex-col">
      {composing && onCreate && (
        <div className="pb-3">
          <MemoEditor
            onSubmit={(content) => {
              onCreate(content)
              closeCompose()
            }}
            onRequestCancel={requestCancelCompose}
            onDirtyChange={setDirty}
            submitLabel="작성"
          />
        </div>
      )}

      {isEmpty ? (
        <p className="px-1 py-8 text-center text-sm text-gray-500">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-200">
          {memos.map((memo) =>
            editingId === memo.id ? (
              <li key={memo.id} className="py-3">
                <MemoEditor
                  initialContent={memo.content}
                  onSubmit={(content) => {
                    onUpdate?.(memo.id, content)
                    closeEdit()
                  }}
                  onRequestCancel={requestCancelEdit}
                  onDirtyChange={setDirty}
                />
              </li>
            ) : (
              <li key={memo.id} className="py-4">
                <MemoCard
                  memo={memo}
                  renderKebab={
                    canManage
                      ? (m) =>
                          renderKebab?.(m, {
                            edit: () => startEdit(m.id),
                            remove: () => requestDelete(m.id),
                          })
                      : undefined
                  }
                />
              </li>
            )
          )}
        </ul>
      )}

      <ConfirmDialog
        open={guard.confirmOpen}
        onOpenChange={guard.setConfirmOpen}
        title="편집을 취소할까요?"
        description="저장하지 않은 변경 내용이 사라져요."
        confirmLabel="편집 취소"
        destructive
        onConfirm={guard.confirmProceed}
      />
    </div>
  )
}

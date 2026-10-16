'use client'

import { useMemo, useState } from 'react'
import {
  ActionDrawer,
  ConfirmDialog,
  EditIcon,
  Fab,
  FolderAddIcon,
  MoreVerticalIcon,
  SearchIcon,
  TopBar,
  TrashIcon,
} from '@bconnect/ui'
import { StorageExplorerView } from '@bconnect/features'
import type { Folder } from '@bconnect/features'
import { matchHangul } from '@bconnect/lib/search'
import { useAllFolders, useFolderMutations } from '../_hooks/useDrive'

export function CareerStorageExplorer() {
  const { data: folders, isLoading, isError } = useAllFolders()
  const { createFolder, updateFolder, deleteFolder } = useFolderMutations()
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [kebabFor, setKebabFor] = useState<Folder | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Folder | null>(null)

  const filtered = useMemo(
    () => (folders ?? []).filter((f) => matchHangul(f.title, query)),
    [folders, query]
  )

  return (
    <>
      <TopBar variant="default" title="저장소" showBack={false} />
      <div className="p-4">
        <StorageExplorerView
          folders={filtered}
          isLoading={isLoading}
          isError={isError}
          folderHref={(id) => `/storage/${id}`}
          emptyLabel={query ? '검색 결과가 없어요' : '폴더가 없습니다'}
          searchSlot={
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5">
              <SearchIcon size={18} className="shrink-0 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="폴더 또는 이미지명 검색"
                aria-label="폴더 또는 이미지명 검색"
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          }
          creating={creating}
          onCreateSubmit={(title) => {
            createFolder(title)
            setCreating(false)
          }}
          onCreateCancel={() => setCreating(false)}
          editingId={editingId}
          onRenameSubmit={(id, title) => {
            updateFolder(id, title)
            setEditingId(null)
          }}
          onRenameCancel={() => setEditingId(null)}
          renderKebab={(folder) => (
            <button
              type="button"
              aria-label="폴더 메뉴"
              onClick={() => setKebabFor(folder)}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <MoreVerticalIcon size={18} />
            </button>
          )}
        />
      </div>

      <Fab
        aria-label="폴더 추가"
        onClick={() => setCreating(true)}
        icon={<FolderAddIcon size={22} />}
      />

      <ActionDrawer
        open={kebabFor != null}
        onOpenChange={(open) => {
          if (!open) setKebabFor(null)
        }}
        items={
          kebabFor
            ? [
                {
                  label: '이름 수정',
                  icon: <EditIcon size={18} />,
                  onSelect: () => setEditingId(kebabFor.id),
                },
                {
                  label: '삭제',
                  icon: <TrashIcon size={18} />,
                  destructive: true,
                  onSelect: () => setPendingDelete(kebabFor),
                },
              ]
            : []
        }
      />
      <ConfirmDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="폴더를 삭제할까요?"
        description="폴더 안의 이미지와 메모가 모두 삭제돼요."
        destructive
        confirmLabel="삭제"
        onConfirm={() => {
          if (pendingDelete) deleteFolder(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </>
  )
}

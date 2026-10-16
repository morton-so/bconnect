import type { ReactNode } from 'react'
import { ExplorerFolderList } from './ExplorerFolderList'
import { FolderRowEditor } from './FolderRowEditor'
import type { Folder } from './types'

export interface StorageExplorerViewProps {
  folders: Folder[]
  isLoading: boolean
  isError: boolean
  folderHref: (folderId: string) => string
  searchSlot?: ReactNode
  renderKebab?: (folder: Folder) => ReactNode
  creating?: boolean
  onCreateSubmit?: (title: string) => void
  onCreateCancel?: () => void
  editingId?: string | null
  onRenameSubmit?: (id: string, title: string) => void
  onRenameCancel?: () => void
  emptyLabel?: string
}

export function StorageExplorerView({
  folders,
  isLoading,
  isError,
  folderHref,
  searchSlot,
  renderKebab,
  creating,
  onCreateSubmit,
  onCreateCancel,
  editingId,
  onRenameSubmit,
  onRenameCancel,
  emptyLabel,
}: StorageExplorerViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {searchSlot}
      {isLoading ? (
        <p className="px-1 py-8 text-center text-sm text-gray-500">불러오는 중…</p>
      ) : isError ? (
        <p className="px-1 py-8 text-center text-sm text-gray-500">폴더를 불러올 수 없습니다</p>
      ) : (
        <div className="flex flex-col gap-2">
          {creating && onCreateSubmit && (
            <FolderRowEditor
              onSubmit={onCreateSubmit}
              onCancel={() => onCreateCancel?.()}
              placeholder="새 폴더 이름"
            />
          )}
          <ExplorerFolderList
            folders={folders}
            folderHref={folderHref}
            renderKebab={renderKebab}
            editingId={editingId}
            onRenameSubmit={onRenameSubmit}
            onRenameCancel={onRenameCancel}
            emptyLabel={emptyLabel}
          />
        </div>
      )}
    </div>
  )
}

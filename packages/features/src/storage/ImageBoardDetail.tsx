'use client'

import { Button, Select } from '@bconnect/ui'
import { BoardMetadataTable } from './BoardMetadataTable'
import { BoardPositionPicker } from './BoardPositionPicker'
import type { BoardImage, BoardPosition, BoardRow, Folder } from './types'

export interface ImageBoardDetailProps {
  image: BoardImage
  folders: Folder[]
  onChangeRows?: (rows: BoardRow[]) => void
  onChangePosition?: (position: BoardPosition) => void
  onMoveFolder?: (folderId: string) => void
  onChangeDescription?: (text: string) => void
  onSubmit?: () => void
  onDeselect?: () => void
  showPositionPicker?: boolean
  submitLabel?: string
  readOnly?: boolean
}

export function ImageBoardDetail({
  image,
  folders,
  onChangeRows,
  onChangePosition,
  onMoveFolder,
  onChangeDescription,
  onSubmit,
  onDeselect,
  showPositionPicker,
  submitLabel = '저장',
  readOnly,
}: ImageBoardDetailProps) {
  const folderOptions = folders.map((f) => ({ value: f.id, label: f.title }))

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">상세정보</h3>
        <BoardMetadataTable
          rows={image.boardRows}
          onChange={(rows) => onChangeRows?.(rows)}
          readOnly={readOnly || !onChangeRows}
        />
      </section>

      {showPositionPicker && onChangePosition && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">보드 위치</h3>
          <BoardPositionPicker value={image.boardPosition} onChange={onChangePosition} />
        </section>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">폴더</h3>
        <Select
          value={image.folderId}
          onChange={(v) => onMoveFolder?.(Array.isArray(v) ? (v[0] ?? '') : v)}
          options={folderOptions}
          disabled={readOnly || !onMoveFolder}
        />
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">설명</h3>
        <textarea
          value={image.description}
          onChange={(e) => onChangeDescription?.(e.target.value)}
          rows={4}
          placeholder="설명을 입력해주세요"
          disabled={readOnly || !onChangeDescription}
          className="w-full resize-none rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
      </section>

      {(onSubmit || onDeselect) && (
        <div className="flex gap-2">
          {onDeselect && (
            <Button variant="ghost" size="full" onClick={onDeselect}>
              선택 해제
            </Button>
          )}
          {onSubmit && (
            <Button variant="primary" size="full" onClick={onSubmit}>
              {submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

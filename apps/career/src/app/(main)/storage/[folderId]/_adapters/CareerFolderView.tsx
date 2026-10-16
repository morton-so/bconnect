'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseAsString, parseAsStringEnum, useQueryState } from 'nuqs'
import { Fab, ImageUploadIcon, Tab, TopBar, useToast } from '@bconnect/ui'
import { FolderImagesView } from '@bconnect/features'
import { useFolder, useFolderImages, useUploadImages } from '@/app/(main)/storage/_hooks/useDrive'
import { CareerMemoTab } from './CareerMemoTab'
import { CareerFileDetail } from './CareerFileDetail'

const MIN_COLS = 2
const MAX_COLS = 5
const clampCols = (n: number) => Math.min(MAX_COLS, Math.max(MIN_COLS, n))

export function CareerFolderView({ folderId }: { folderId: string }) {
  const router = useRouter()
  const { data: folder } = useFolder(folderId)
  const { data: images, isLoading, isError } = useFolderImages(folderId)
  const upload = useUploadImages(folderId)
  const { toast } = useToast()
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<'images' | 'memo'>(['images', 'memo']).withDefault('images')
  )
  const [file, setFile] = useQueryState('file', parseAsString.withOptions({ history: 'push' }))
  const [columns, setColumns] = useState(3)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const lastPinch = useRef(0)
  const lastZoomAt = useRef(0)

  const title = folder?.title ?? '폴더'
  const onBack = () => {
    if (file)
      setFile(null)
    else router.push('/storage')
  }

  useEffect(() => {
    const el = galleryRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      const now = Date.now()
      if (now - lastZoomAt.current < 120) return
      lastZoomAt.current = now
      setColumns((c) => clampCols(e.deltaY < 0 ? c - 1 : c + 1))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return
    const [a, b] = [e.touches[0], e.touches[1]]
    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    if (lastPinch.current === 0) {
      lastPinch.current = dist
      return
    }
    const delta = dist - lastPinch.current
    if (Math.abs(delta) > 40) {
      setColumns((c) => clampCols(delta > 0 ? c - 1 : c + 1))
      lastPinch.current = dist
    }
  }
  const resetPinch = () => {
    lastPinch.current = 0
  }

  // TODO: 보드 작성 단계는 BE 메타 저장 지원 시 복원
  const handlePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (picked.length === 0) return
    upload.mutate(picked, {
      onSuccess: () => toast({ title: '업로드되었어요' }),
      onError: () => toast({ title: '업로드에 실패했어요' }),
    })
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-30 bg-white">
        <TopBar variant="default" title={title} showBack onBack={onBack} />
        {!file && (
          <Tab
            items={[
              { key: 'images', label: '이미지' },
              { key: 'memo', label: '메모' },
            ]}
            activeKey={tab}
            onChange={(key) => setTab(key === 'memo' ? 'memo' : 'images')}
          />
        )}
      </div>

      {file ? (
        <CareerFileDetail
          folderId={folderId}
          selectedId={file}
          onSelectImage={(id) => setFile(id)}
        />
      ) : tab === 'images' ? (
        <>
          <div
            ref={galleryRef}
            onTouchMove={onTouchMove}
            onTouchEnd={resetPinch}
            className="touch-pan-y p-4"
          >
            <FolderImagesView
              images={images ?? []}
              isLoading={isLoading}
              isError={isError}
              columns={columns}
              onSelect={(id) => setFile(id)}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePicked}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
          <Fab
            aria-label="이미지 업로드"
            onClick={() => {
              if (!upload.isPending) fileInputRef.current?.click()
            }}
            icon={<ImageUploadIcon size={22} />}
          />
        </>
      ) : (
        <div className="p-4">
          <CareerMemoTab folderId={folderId} />
        </div>
      )}
    </div>
  )
}

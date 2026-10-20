'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDocumentTitle,
} from '@bconnect/ui'
import { FolderImagesView } from '@bconnect/features'
import { useGetProject } from '@bconnect/api-client'
import { StorageHeader } from '@/app/(main)/projects/[projectId]/storage/_components/StorageHeader'
import { StorageMemoPanel } from './StorageMemoPanel'
import { StorageFileDetail } from './StorageFileDetail'
import { useFolderImages } from '@/app/(main)/projects/[projectId]/storage/_hooks/useDrive'
import { useStorageParams } from '../_hooks/useStorageParams'

export function StorageFolder({ projectId, folderId }: { projectId: string; folderId: string }) {
  const [{ file }] = useStorageParams()
  const { data: images, isLoading, isError } = useFolderImages(folderId)
  const { data: project } = useGetProject(Number(projectId))
  const basePath = `/projects/${projectId}/storage/${folderId}`

  // 탭 title 에 프로젝트명 반영 (리뷰 반영). 로딩 전엔 static fallback('저장소') 유지.
  useDocumentTitle(project ? `${project.title} - 저장소` : undefined)

  return (
    <div className="flex h-full flex-col">
      <StorageHeader projectId={projectId} folderId={folderId} />
      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="68" minSize="40">
          <div className="h-full overflow-y-auto p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">이미지</h2>
            <FolderImagesView
              images={images ?? []}
              isLoading={isLoading}
              isError={isError}
              selectedId={file ?? undefined}
              imageHref={(id) => `${basePath}?file=${id}`}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="32" minSize="20">
          <div className="h-full overflow-y-auto">
            {file ? (
              <StorageFileDetail
                key={file}
                folderId={folderId}
                fileId={file}
                closeHref={basePath}
              />
            ) : (
              <StorageMemoPanel folderId={folderId} />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

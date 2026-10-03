/**
 * @figma-todo 공유 저장소 폴더 페이지 디자인 미정
 */
import { Suspense } from 'react'
import { StorageFolder } from '../_components/StorageFolder'

export default async function StorageFolderPage({
  params,
}: {
  params: Promise<{ projectId: string; folderId: string }>
}) {
  const { projectId, folderId } = await params
  return (
    <Suspense>
      <StorageFolder projectId={projectId} folderId={folderId} />
    </Suspense>
  )
}

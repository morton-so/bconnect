/**
 * @figma-todo 동산보드 폴더 페이지 디자인 미정
 */
import { Suspense } from 'react'
import { CareerFolderView } from './_adapters/CareerFolderView'

export default async function CareerStorageFolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await params
  return (
    <Suspense>
      <CareerFolderView folderId={folderId} />
    </Suspense>
  )
}

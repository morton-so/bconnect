/**
 * @figma-todo 공유 저장소 루트 페이지 디자인 미정
 */
import { StorageRoot } from './_components/StorageRoot'

export default async function StoragePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  return <StorageRoot projectId={projectId} />
}

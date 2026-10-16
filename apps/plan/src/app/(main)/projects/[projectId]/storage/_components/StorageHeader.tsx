'use client'

import Link from 'next/link'
import { useGetProject } from '@bconnect/api-client'
import { useFolder } from '../_hooks/useDrive'

export function StorageHeader({ projectId, folderId }: { projectId: string; folderId?: string }) {
  const { data: project } = useGetProject(Number(projectId))
  const { data: folder } = useFolder(projectId, folderId)

  const projectName = project?.title ?? '프로젝트'

  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-gray-900">
          <Link href={`/projects/${projectId}/storage`} className="hover:underline">
            {projectName}
          </Link>
          {folder ? <span className="font-normal text-gray-400"> › {folder.title}</span> : null}
        </h1>
        <p className="mt-1 text-xs text-gray-500">TIP. 폴더를 현장/공종별로 관리해보세요</p>
      </div>
      {/* TODO: BE 지원 시 주석 해제 + useStorageUsage(_hooks/useDrive.ts) 실연동 */}
      {/* 용량바
      {usage && (
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <Progress value={pct} className="w-28" />
          <span className="text-xs text-gray-400">
            {toMB(usage.usedBytes)}/{toGB(usage.totalBytes)}
          </span>
        </div>
      )} */}
    </div>
  )
}

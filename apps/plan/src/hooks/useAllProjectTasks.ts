'use client'

import { useMemo } from 'react'
import {
  getGetProjectTasksQueryOptions,
  useAuthHint,
  useGetProjects,
  useQueries,
} from '@bconnect/api-client'
import { toScheduleTask } from '@/lib/schedule/task-helpers'
import type { ScheduleTask } from '@/lib/schedule/types'

export function useAllProjectTasks() {
  const isAuthenticated = useAuthHint()
  const { data: projects, isLoading: isProjectsLoading } = useGetProjects({
    query: { enabled: isAuthenticated },
  })
  const projectIds = useMemo(() => (projects ?? []).flatMap((p) => p.id ?? []), [projects])

  const taskQueries = useQueries({
    queries: projectIds.map((id) => getGetProjectTasksQueryOptions(id)),
  })

  const tasks: ScheduleTask[] = useMemo(
    () => taskQueries.flatMap((q) => (q.data ?? []).map((task) => toScheduleTask(task))),
    [taskQueries]
  )

  const projectTitleById = useMemo(() => {
    const map = new Map<number, string>()
    for (const project of projects ?? []) {
      if (project.id != null) map.set(project.id, project.title ?? '')
    }
    return map
  }, [projects])

  return {
    tasks,
    projects: projects ?? [],
    projectTitleById,
    isLoading: isProjectsLoading || taskQueries.some((q) => q.isLoading),
  }
}

'use client'

import { parseAsInteger, useQueryState } from 'nuqs'
import { useAllProjectTasks } from '@/hooks/useAllProjectTasks'

export function useSelectedTask() {
  const [taskId, setTaskId] = useQueryState('task', parseAsInteger)
  const { tasks, projectTitleById } = useAllProjectTasks()
  const task = taskId != null ? tasks.find((t) => t.id === taskId) : undefined
  const projectTitle = task ? projectTitleById.get(task.projectId) : undefined
  const label = task ? `${projectTitle ?? '프로젝트'} | ${task.title}` : null

  return {
    taskId,
    task,
    projectId: task?.projectId ?? null,
    label,
    select: (nextTaskId: number | null) => setTaskId(nextTaskId),
  }
}

'use client'

import { useRef } from 'react'
import {
  getGetProjectTasksQueryKey,
  useCreateTaskCompany,
  useDeleteTask,
  useQueryClient,
  useUpdateTaskCompany,
} from '@bconnect/api-client'
import type { CompanyTask } from '@bconnect/api-client'
import {
  applyTaskPatch,
  toCreateTaskRequest,
  toUpdateTaskRequest,
} from '@/lib/schedule/task-helpers'
import type { TaskFormValues } from '@/app/(main)/_lib/schema'
import type { ScheduleTask } from '@/lib/schedule/types'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'

export function useTaskMutations(projectId: string) {
  const queryClient = useQueryClient()
  const tasksKey = getGetProjectTasksQueryKey(Number(projectId))

  const invalidateTasks = () => queryClient.invalidateQueries({ queryKey: tasksKey })

  const { mutate: mutateUpdate } = useUpdateTaskCompany({
    mutation: {
      onError: () => invalidateTasks(),
    },
  })
  const { mutate: mutateDelete } = useDeleteTask({
    mutation: {
      onError: () => invalidateTasks(),
      onSuccess: () => invalidateTasks(),
    },
  })
  const { mutateAsync: mutateCreate, isPending: isCreating } = useCreateTaskCompany()

  const readTask = (taskId: number): CompanyTask | undefined =>
    queryClient.getQueryData<CompanyTask[]>(tasksKey)?.find((t: CompanyTask) => t.id === taskId)

  const pendingIdRef = useRef<number | null>(null)
  const debouncedSave = useDebouncedCallback((taskId: number) => {
    pendingIdRef.current = null
    const task = readTask(taskId)
    if (task) mutateUpdate({ id: taskId, data: toUpdateTaskRequest(task) })
  }, 500)

  const updateTask = (taskId: number, patch: Partial<Omit<ScheduleTask, 'id'>>) => {
    queryClient.setQueryData<CompanyTask[]>(tasksKey, (old: CompanyTask[] | undefined) =>
      old?.map((t: CompanyTask) => (t.id === taskId ? applyTaskPatch(t, patch) : t))
    )
    if (pendingIdRef.current != null && pendingIdRef.current !== taskId) debouncedSave.flush()
    pendingIdRef.current = taskId
    debouncedSave(taskId)
  }

  const deleteTask = (taskId: number) => {
    if (pendingIdRef.current === taskId) debouncedSave.cancel()
    queryClient.setQueryData<CompanyTask[]>(tasksKey, (old: CompanyTask[] | undefined) =>
      old?.filter((t: CompanyTask) => t.id !== taskId)
    )
    mutateDelete({ id: taskId })
  }

  const createTask = async (values: TaskFormValues): Promise<number> => {
    const id = await mutateCreate({ data: toCreateTaskRequest(values, projectId) })
    await invalidateTasks()
    return id
  }

  const flushPendingSave = () => debouncedSave.flush()

  return { updateTask, deleteTask, createTask, isCreating, flushPendingSave }
}

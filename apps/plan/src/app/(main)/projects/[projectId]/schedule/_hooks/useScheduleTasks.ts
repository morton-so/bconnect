'use client'

import { useMemo } from 'react'
import {
  getGetProfileQueryOptions,
  getGetTaskOffersQueryOptions,
  TaskStatus,
  useGetProjectTasks,
  useQueries,
} from '@bconnect/api-client'
import type { Offer, Profile } from '@bconnect/api-client'
import { useDraftTaskStore } from '@/stores/draft-task-store'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { DRAFT_TASK_ID, toScheduleTask } from '@/lib/schedule/task-helpers'
import type { ScheduleTask } from '@/lib/schedule/types'

export function useScheduleTasks(projectId: string) {
  const { data: beTasks } = useGetProjectTasks(Number(projectId))
  const draft = useDraftTaskStore((s) => s.draft)
  const startDraft = useDraftTaskStore((s) => s.startDraft)
  const patchDraft = useDraftTaskStore((s) => s.patchDraft)
  const clearDraft = useDraftTaskStore((s) => s.clearDraft)
  const mutations = useTaskMutations(projectId)

  const offerTaskIds = useMemo(
    () =>
      (beTasks ?? []).flatMap((t) =>
        t.id != null &&
        (t.status === TaskStatus.NONE ||
          t.status === TaskStatus.OPEN ||
          t.status === TaskStatus.OFFERED)
          ? t.id
          : []
      ),
    [beTasks]
  )
  const offerQueries = useQueries({
    queries: offerTaskIds.map((id) => getGetTaskOffersQueryOptions(id)),
  })
  const offersByTask = useMemo(() => {
    const map = new Map<number, Offer[]>()
    offerQueries.forEach((q, i) => {
      if (q.data) map.set(offerTaskIds[i], q.data)
    })
    return map
  }, [offerQueries, offerTaskIds])

  const workerIds = useMemo(
    () => [...new Set((beTasks ?? []).flatMap((t) => t.workerId ?? []))],
    [beTasks]
  )
  const profileQueries = useQueries({
    queries: workerIds.map((id) => getGetProfileQueryOptions(id)),
  })
  const profileByWorker = useMemo(() => {
    const map = new Map<number, Profile>()
    profileQueries.forEach((q, i) => {
      if (q.data) map.set(workerIds[i], q.data)
    })
    return map
  }, [profileQueries, workerIds])

  const tasks = useMemo(() => {
    const mapped = (beTasks ?? []).map((t) =>
      toScheduleTask(
        t,
        t.id != null ? offersByTask.get(t.id) : undefined,
        t.workerId != null ? profileByWorker.get(t.workerId) : undefined
      )
    )
    const merged = draft && draft.projectId === Number(projectId) ? [...mapped, draft] : mapped
    return merged.sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end))
  }, [beTasks, offersByTask, profileByWorker, draft, projectId])

  const updateTask = (id: number, patch: Partial<Omit<ScheduleTask, 'id'>>) => {
    if (id === DRAFT_TASK_ID) {
      patchDraft(patch)
      return
    }
    mutations.updateTask(id, patch)
  }

  const createTask = (input: Pick<ScheduleTask, 'projectId' | 'start' | 'end'>): number => {
    startDraft(input)
    return DRAFT_TASK_ID
  }

  const deleteTask = (id: number) => {
    if (id === DRAFT_TASK_ID) {
      clearDraft()
      return
    }
    mutations.deleteTask(id)
  }

  return { tasks, updateTask, createTask, deleteTask }
}

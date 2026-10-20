'use client'

import { useGetCoworkerTasks, useGetTasks } from '@bconnect/api-client'
import {
  toAssigneeCalendarTask,
  toCoworkerCalendarTask,
  toWorkerCalendarTask,
} from '../_lib/mapper'

export function useCalendarTasks(member: number | null) {
  const mine = useGetTasks({ query: { enabled: member == null } })
  const coworkers = useGetCoworkerTasks(member!, { query: { enabled: member != null } })

  const tasks = [
    ...(mine.data?.workerTasks ?? []).map(toWorkerCalendarTask),
    ...(mine.data?.assigneeTasks ?? []).map(toAssigneeCalendarTask),
  ]
  const coworkerTasks = (coworkers.data ?? []).map(toCoworkerCalendarTask)

  const query = member == null ? mine : coworkers
  return { tasks, coworkerTasks, isError: query.isError, refetch: query.refetch }
}

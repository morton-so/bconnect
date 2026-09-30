import type { AssigneeTask, WorkerTask } from '@bconnect/api-client'
import type { CalendarTask } from './types'

/** 기술자 생성 작업 */
export function toWorkerCalendarTask(task: WorkerTask): CalendarTask {
  return {
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    colorIndex: task.id,
    progress: task.progress,
    canManage: true,
    company: task.company ?? undefined,
    address: task.address ?? undefined,
    trades: task.trades,
    requirement: '',
    memo: task.memo ?? '',
  }
}

/** 업체 제안 작업 */
export function toAssigneeCalendarTask(task: AssigneeTask): CalendarTask {
  return {
    id: task.id,
    title: task.title,
    start: task.start,
    end: task.end,
    colorIndex: task.id,
    progress: task.progress,
    canManage: false,
    status: task.status,
    address: task.address ?? undefined,
    trades: task.trades,
    requirement: task.requirement ?? '',
    memo: task.memo ?? '',
  }
}

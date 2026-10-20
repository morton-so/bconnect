import { OfferStatus, REGION_LABELS, ROLE_LABELS, TRADE_LABELS } from '@bconnect/api-client'
import type {
  CompanyTask,
  Offer,
  Profile,
  ProfileSummary,
  UpdateProjectTaskRequest,
  CreateProjectTaskRequest,
} from '@bconnect/api-client'
import type { TaskFormValues } from '@/app/(main)/_lib/schema'
import type { ScheduleTask } from './types'

export const DRAFT_TASK_ID = 0

export function toOfferQueue(offers: Offer[]): Offer[] {
  return offers
    .filter((o) => o.status === OfferStatus.ACTIVE || o.status === OfferStatus.PENDING)
    .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
}

export function workerLabels(profile: ProfileSummary | undefined): string[] {
  if (!profile) return []
  return [
    profile.address?.state && REGION_LABELS[profile.address.state],
    ROLE_LABELS[profile.role],
    profile.primaryTrade && TRADE_LABELS[profile.primaryTrade],
  ].filter((label): label is string => !!label)
}

export function toScheduleTask(
  task: CompanyTask,
  offers?: Offer[],
  worker?: Profile
): ScheduleTask {
  return { ...task, offers: offers && toOfferQueue(offers), worker }
}

export function applyTaskPatch(
  task: CompanyTask,
  patch: Partial<Omit<ScheduleTask, 'id'>>
): CompanyTask {
  return {
    ...task,
    ...(patch.trades !== undefined && { trades: patch.trades }),
    ...(patch.title !== undefined && { title: patch.title }),
    ...(patch.start !== undefined && { start: patch.start }),
    ...(patch.end !== undefined && { end: patch.end }),
    ...(patch.progress !== undefined && { progress: patch.progress }),
    ...(patch.requirement !== undefined && { requirement: patch.requirement }),
    ...(patch.memo !== undefined && { memo: patch.memo }),
  }
}

export function toUpdateTaskRequest(task: CompanyTask): UpdateProjectTaskRequest {
  return {
    trades: task.trades,
    start: task.start,
    end: task.end,
    progress: task.progress,
    title: task.title,
    requirement: task.requirement ?? '',
    memo: task.memo ?? '',
  }
}

export function toCreateTaskRequest(
  values: TaskFormValues,
  projectId: string
): CreateProjectTaskRequest {
  return {
    trades: values.trades,
    start: values.start,
    end: values.end,
    projectId: Number(projectId),
    title: values.title,
    requirement: values.requirement,
    memo: values.memo,
  }
}

import { OfferStatus, ROLE_LABELS, TRADE_LABELS } from '@bconnect/api-client'
import type {
  CompanyTask,
  Offer,
  Profile,
  UpdateProjectTaskRequest,
  CreateProjectTaskRequest,
} from '@bconnect/api-client'
import type { OfferQueueItem, ScheduleTask, TaskAssignee } from './types'

export const DRAFT_TASK_ID = 'draft'

export function toNumericTaskId(id: string | null | undefined): number | null {
  if (!id || id === DRAFT_TASK_ID) return null
  const n = Number(id)
  return Number.isFinite(n) ? n : null
}

export function toOfferQueueItem(offer: Offer): OfferQueueItem {
  const trade = offer.profile?.primaryTrade
  return {
    profileId: offer.member?.id ?? 0,
    name: offer.member?.name ?? '',
    picture: offer.member?.picture ?? undefined,
    region: offer.profile?.address?.state ?? '',
    level: offer.profile ? ROLE_LABELS[offer.profile.role] : '',
    specialty: trade ? (TRADE_LABELS[trade] ?? '') : '',
    status: offer.status === OfferStatus.ACTIVE ? 'offered' : 'waiting',
  }
}

export function toAssigneeFromProfile(profile: Profile): TaskAssignee {
  const trade = profile.primaryTrade
  return {
    profileId: profile.member?.id ?? 0,
    name: profile.member?.name ?? '',
    region: profile.address?.state ?? '',
    level: ROLE_LABELS[profile.role],
    specialty: trade ? (TRADE_LABELS[trade] ?? '') : '',
  }
}

export function toScheduleTask(
  task: CompanyTask,
  offers?: Offer[],
  workerProfile?: Profile
): ScheduleTask {
  const queue = offers
    ?.filter((o) => o.status === OfferStatus.ACTIVE || o.status === OfferStatus.PENDING)
    .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
    .map(toOfferQueueItem)
  const active = queue?.find((o) => o.status === 'offered')
  const assignee = workerProfile
    ? toAssigneeFromProfile(workerProfile)
    : active
      ? {
          profileId: active.profileId,
          name: active.name,
          region: active.region,
          level: active.level,
          specialty: active.specialty,
        }
      : undefined
  return {
    id: String(task.id),
    projectId: String(task.projectId),
    trades: task.trades,
    title: task.title,
    start: task.start,
    end: task.end,
    status: task.status,
    progress: task.progress,
    requirement: task.requirement ?? '',
    memo: task.memo ?? '',
    offerQueue: queue,
    assignee,
  }
}

export function applyFePatch(
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

export function toUpdateRequest(task: CompanyTask): UpdateProjectTaskRequest {
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

export interface TaskFormInput {
  title: string
  start: string
  end: string
  trades: ScheduleTask['trades']
  requirement: string
  memo: string
}

export function toCreateRequest(
  values: TaskFormInput,
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

import type { CompanyTask, Offer, Profile } from '@bconnect/api-client'

export type TaskBarTone = 'completed' | 'in_progress' | 'recruited' | 'recruiting' | 'not_started'

export type ScheduleTask = CompanyTask & {
  draft?: boolean
  /** 섭외 대기열 — ACTIVE·PENDING offer 를 seq 순으로. 대표 기술자는 taskAssignee 가 파생 */
  offers?: Offer[]
  /** 섭외 확정(workerId) 기술자 프로필 */
  worker?: Profile
}

export type ScheduleGridProps = {
  projectId: string
  today?: string
}

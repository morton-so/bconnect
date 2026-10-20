import {
  OfferStatus,
  TaskProgress,
  TaskStatus,
  TRADE_LABELS,
  type Offer,
  type Trade,
} from '@bconnect/api-client'
import type { ScheduleTask, TaskBarTone } from '@/lib/schedule/types'

export function tradesLabel(trades: Trade[]): string {
  return trades.map((t) => TRADE_LABELS[t] ?? t).join(' · ')
}

export function taskAssignee(task: ScheduleTask): Pick<Offer, 'member' | 'profile'> | undefined {
  if (task.worker) return { member: task.worker.member, profile: task.worker }
  return task.offers?.find((o) => o.status === OfferStatus.ACTIVE)
}

export const COL_CATEGORY = 140
export const COL_STATUS = 100
export const COL_PROGRESS = 100
export const COL_ASSIGNEE = 220

export const COL_LEFT_TOTAL = COL_CATEGORY + COL_STATUS + COL_PROGRESS + COL_ASSIGNEE

export const DAY_WIDTH = 44
export const RIGHT_PAD_WIDTH = 88
export const ROW_HEIGHT = 52
export const HEADER_HEIGHT = 40
export const BAR_HEIGHT = 36
export const BAR_TOP = 7.5

export const PAST_CONTEXT_DAYS = 3

export const STICKY_LEFT = [
  0,
  COL_CATEGORY,
  COL_CATEGORY + COL_STATUS,
  COL_CATEGORY + COL_STATUS + COL_PROGRESS,
]

export function barTone(task: Pick<ScheduleTask, 'status' | 'progress'>): TaskBarTone {
  if (task.progress === TaskProgress.COMPLETED) return 'completed'
  if (task.progress === TaskProgress.IN_PROGRESS) return 'in_progress'
  if (task.status === TaskStatus.ASSIGNED) return 'recruited'
  if (task.status === TaskStatus.OFFERED) return 'recruiting'
  return 'not_started'
}

export const BAR_COLORS = [
  { bg: '#b0b0b0', text: '#5a5a5a' },
  { bg: '#284dbc', text: '#ffffff' },
  { bg: '#569365', text: '#ffffff' },
  { bg: '#ffbf70', text: '#2d2d2d' },
  { bg: '#d0d0d0', text: '#2d2d2d' },
]

export function barColor(taskId: number) {
  const hash = [...String(taskId)].reduce((sum, c) => sum + c.charCodeAt(0), 0)
  return BAR_COLORS[hash % BAR_COLORS.length]
}

export const BAR_TONE_LABELS: Record<TaskBarTone, string> = {
  completed: '시공 완료',
  in_progress: '진행 중',
  recruited: '섭외 됨',
  recruiting: '섭외 중',
  not_started: '시작 전',
}

export const STATUS_PILL_STYLES: Record<TaskStatus, string> = {
  [TaskStatus.NONE]: 'bg-white border border-[#d0d0d0] text-[#a5a5a5]',
  [TaskStatus.OPEN]: 'bg-primary-50 border border-[#c0d0ff] text-primary',
  [TaskStatus.OFFERED]: 'bg-[#fff3e0] border border-[#ffe0b2] text-[#e6780a]',
  [TaskStatus.ASSIGNED]: 'bg-primary text-white',
}

export const PROGRESS_PILL_STYLES: Record<TaskProgress, string> = {
  [TaskProgress.TODO]: 'bg-white border border-[#d0d0d0] text-[#a5a5a5]',
  [TaskProgress.IN_PROGRESS]: 'bg-primary-50 border border-[#c0d0ff] text-primary',
  [TaskProgress.COMPLETED]: 'bg-[#f0f0f0] border border-[#d0d0d0] text-[#3d3d3d]',
}

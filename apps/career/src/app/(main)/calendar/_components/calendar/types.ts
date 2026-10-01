import type { Address, TaskProgress, TaskStatus, Trade } from '@bconnect/api-client'

interface CalendarTaskBase {
  id: number
  title: string
  start: string
  end: string
  colorIndex: number
  progress: TaskProgress
  company?: string
  address?: Address
  trades: Trade[]
  requirement: string
  memo: string
}

export type CalendarTask = CalendarTaskBase &
  ({ canManage: true; status?: never } | { canManage: false; status: TaskStatus })

export type CalendarBarTask = Pick<
  CalendarTaskBase,
  'id' | 'title' | 'start' | 'end' | 'colorIndex'
>

// 작업 바
export interface BarSegment {
  task: CalendarBarTask
  colStart: number
  colSpan: number
  lane: number
  continuesLeft: boolean
  continuesRight: boolean
}

export interface WeekRowModel {
  cells: string[]
  segments: BarSegment[]
  overflowByDay: number[]
}

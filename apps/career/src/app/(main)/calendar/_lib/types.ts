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

export interface BarSegment {
  task: CalendarBarTask
  colStart: number // 시작 열 (0~6)
  colSpan: number // 차지 열 수 (1~7)
  lane: number // 행 번호 (0~N)
  continuesLeft: boolean
  continuesRight: boolean
}

export interface WeekRowModel {
  cells: string[]
  segments: BarSegment[]
  overflowByDay: number[] // 날짜별 숨겨진 작업 수 (+N 표시용)
}

import { daysBetween } from '@bconnect/config/date'
import { buildMonthMatrix, clampSegmentToWeek } from './date-helpers'
import type { BarSegment, CalendarTask, WeekRowModel } from './types'

// 셀당 최대 레인 수
const MAX_LANES = 2

/** 주(week) 단위 레이아웃 */
export function buildWeekRows(monthIso: string, tasks: CalendarTask[]): WeekRowModel[] {
  return buildMonthMatrix(monthIso).map((cells) => {
    const weekStart = cells[0]!
    const weekEnd = cells[6]!

    const clamped = tasks
      .map((task) => {
        const seg = clampSegmentToWeek(task.start, task.end, weekStart, weekEnd)
        return seg ? { task, seg } : null
      })
      .filter((x): x is { task: CalendarTask; seg: { start: string; end: string } } => x !== null)
      .sort((a, b) => {
        // 시작일 오름차순, 길이 내림차순 정렬
        if (a.seg.start !== b.seg.start) return a.seg.start < b.seg.start ? -1 : 1
        return daysBetween(b.seg.start, b.seg.end) - daysBetween(a.seg.start, a.seg.end)
      })

    const laneEnds: number[] = []
    const segments: BarSegment[] = []
    const overflowByDay = [0, 0, 0, 0, 0, 0, 0]

    for (const { task, seg } of clamped) {
      const colStart = daysBetween(weekStart, seg.start)
      const colSpan = daysBetween(seg.start, seg.end) + 1
      const colEnd = colStart + colSpan

      let lane = laneEnds.findIndex((end) => end <= colStart)
      if (lane === -1) {
        lane = laneEnds.length
        laneEnds.push(colEnd)
      } else {
        laneEnds[lane] = colEnd
      }

      if (lane >= MAX_LANES) {
        for (let c = colStart; c < colEnd; c++) overflowByDay[c]! += 1
        continue
      }

      segments.push({
        task,
        colStart,
        colSpan,
        lane,
        continuesLeft: task.start < weekStart,
        continuesRight: task.end > weekEnd,
      })
    }

    return { cells, segments, overflowByDay }
  })
}

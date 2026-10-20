import { addDays, monthEndOf, monthStartOf, toIsoDate } from '@bconnect/lib/date'

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

export function weekdayOf(iso: string): number {
  return new Date(iso).getUTCDay()
}

export function isSameMonth(iso: string, monthIso: string): boolean {
  return iso.slice(0, 7) === monthIso.slice(0, 7)
}

// 내달 1일
export function monthShift(monthIso: string, delta: number): string {
  const y = Number(monthIso.slice(0, 4))
  const m = Number(monthIso.slice(5, 7))
  return toIsoDate(new Date(Date.UTC(y, m - 1 + delta, 1)))
}

// 그리드 시작일 (일요일)
function gridStartOf(monthIso: string): string {
  const first = monthStartOf(monthIso)
  return addDays(first, -weekdayOf(first))
}

/** 그리드 주(week) 수 */
export function monthGridWeeks(monthIso: string): number {
  const leading = weekdayOf(monthStartOf(monthIso))
  const days = Number(monthEndOf(monthIso).slice(8, 10))
  return Math.ceil((leading + days) / 7)
}

/* 그리드 월 매트릭스 */
export function buildMonthMatrix(monthIso: string): string[][] {
  const start = gridStartOf(monthIso)
  const weeks: string[][] = []
  for (let w = 0; w < monthGridWeeks(monthIso); w++) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) week.push(addDays(start, w * 7 + d))
    weeks.push(week)
  }
  return weeks
}

/** 그리드 범위 */
export function gridRangeOf(monthIso: string): { start: string; end: string } {
  const start = gridStartOf(monthIso)
  return { start, end: addDays(start, monthGridWeeks(monthIso) * 7 - 1) }
}

/** 작업 기간과 특정 주(week)의 교집합 */
export function clampSegmentToWeek(
  taskStart: string,
  taskEnd: string,
  weekStart: string,
  weekEnd: string
): { start: string; end: string } | null {
  const s = taskStart > weekStart ? taskStart : weekStart
  const e = taskEnd < weekEnd ? taskEnd : weekEnd
  return s <= e ? { start: s, end: e } : null
}

/** 특정 날짜가 작업 기간에 포함되는지 여부 */
export function dayInTask(iso: string, taskStart: string, taskEnd: string): boolean {
  return taskStart <= iso && iso <= taskEnd
}

/** 문자열 전환 */
export function formatMonthHeader(monthIso: string): { month: string; year: string } {
  return { month: `${Number(monthIso.slice(5, 7))}월`, year: monthIso.slice(0, 4) }
}

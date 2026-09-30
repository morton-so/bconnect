/**
 * 날짜 프리미티브 — 'YYYY-MM-DD' ISO 문자열 기반.
 *
 * 모든 문자열 산술은 ISO 날짜를 UTC 자정으로 해석하므로 타임존과 무관하게 내부 일관적이다.
 * 단 `todayIso()` 만은 사용자 벽시계(로컬)를 따른다 — UTC 로 오늘을 뽑으면 KST 자정~오전 사이 하루가 밀린다.
 */

const ISO_DAY_MS = 86_400_000

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** 로컬(벽시계) 기준 오늘. 기본 선택일/포커스 월의 출처. */
export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / ISO_DAY_MS)
}

/** task.start~end(양끝 포함) 소요 일수. 파싱 불가·역순이면 undefined. */
export function durationDays(start: string, end: string): number | undefined {
  const days = daysBetween(start, end) + 1
  return Number.isFinite(days) && days >= 1 ? days : undefined
}

export function addDays(iso: string, n: number): string {
  return toIsoDate(new Date(new Date(iso).getTime() + n * ISO_DAY_MS))
}

/** 해당 월의 1일 ('YYYY-MM-01'). */
export function monthStartOf(iso: string): string {
  return `${iso.slice(0, 8)}01`
}

/** 해당 월의 말일. */
export function monthEndOf(iso: string): string {
  return toIsoDate(new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), 0)))
}

export function formatIsoDateInput(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`
}

export function isCalendarDate(iso: string): boolean {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

export function ageInYears(birth: string, on: string = todayIso()): number {
  const years = Number(on.slice(0, 4)) - Number(birth.slice(0, 4))
  return on.slice(5) < birth.slice(5) ? years - 1 : years
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()

  if (diff < MINUTE) return '방금'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`
  if (diff < WEEK) return `${Math.floor(diff / DAY)}일 전`
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}주 전`
  return `${Math.floor(diff / MONTH)}개월 전`
}

/** 소요 일수 → '4일 소요'. 일수 계산은 date 의 durationDays 담당. */
export function formatDays(days: number): string {
  return `${days}일 소요`
}

/** "12.25 - 12.26 (총 2일 소요)" — 작업기간 표시(시작·종료일 포함). */
export function formatPeriod(start: string, end: string): string {
  const md = (iso: string) => `${Number(iso.slice(5, 7))}.${Number(iso.slice(8, 10))}`
  const days = daysBetween(start, end) + 1
  return `${md(start)} - ${md(end)} (총 ${days}일 소요)`
}

export function formatChatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const period = hours < 12 ? '오전' : '오후'
  const displayHours = hours % 12 || 12
  return `${period} ${displayHours}:${minutes}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

import { daysBetween } from '@bconnect/lib/date'

/** 12.25 - 12.26 (총 2일) */
export function formatWorkPeriod(start: string, end: string, sep = '-'): string {
  const md = (iso: string) => `${Number(iso.slice(5, 7))}.${Number(iso.slice(8, 10))}`
  const days = daysBetween(start, end) + 1
  return `${md(start)} ${sep} ${md(end)} (총 ${days}일)`
}

'use client'

import { monthStartOf, todayIso } from '@bconnect/lib/date'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

export function useCalendarParams() {
  const today = todayIso()
  const [{ month, day, member }, setParams] = useQueryStates(
    {
      month: parseAsString.withDefault(monthStartOf(today)),
      day: parseAsString.withDefault(today),
      member: parseAsInteger,
    },
    { history: 'replace' }
  )

  const selectDay = (iso: string) => {
    setParams({ day: iso, month: monthStartOf(iso) })
  }

  const setMonth = (monthIso: string) => {
    const inThisMonth = monthIso.slice(0, 7) === today.slice(0, 7)
    const nextDay = inThisMonth ? today : `${monthIso.slice(0, 8)}01`
    setParams({ month: monthIso, day: nextDay })
  }

  const setMember = (memberId: number | null) => {
    setParams({ member: memberId })
  }

  return { month, day, member, today, selectDay, setMonth, setMember }
}

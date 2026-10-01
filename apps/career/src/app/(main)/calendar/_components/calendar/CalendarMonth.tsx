import { todayIso } from '@bconnect/config/date'
import { useState } from 'react'
import { WeekRow } from './WeekRow'
import { WeekdayHeader } from './WeekdayHeader'
import { buildWeekRows } from './grid-builder'
import type { CalendarBarTask } from './types'

interface CalendarMonthProps {
  monthIso: string
  tasks: CalendarBarTask[]
  selectedDay: string
  onSelectDay: (iso: string) => void
}

/** 캘린더 월 그리드 */
export function CalendarMonth({ monthIso, tasks, selectedDay, onSelectDay }: CalendarMonthProps) {
  const rows = buildWeekRows(monthIso, tasks)
  const today = todayIso()

  const [hoveredTaskId, setHoveredTaskId] = useState<number | null>(null)

  return (
    <div>
      <WeekdayHeader />
      {rows.map((row) => (
        <WeekRow
          key={row.cells[0]}
          row={row}
          monthIso={monthIso}
          today={today}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
          hoveredTaskId={hoveredTaskId}
          onHoverTask={setHoveredTaskId}
        />
      ))}
    </div>
  )
}

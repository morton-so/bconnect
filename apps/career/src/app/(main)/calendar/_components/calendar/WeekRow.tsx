import type { MouseEvent } from 'react'
import { useRef } from 'react'
import { DayCell } from './DayCell'
import { TaskBar } from './TaskBar'
import { isSameMonth } from '@/app/(main)/calendar/_lib/date-helpers'
import type { WeekRowModel } from '@/app/(main)/calendar/_lib/types'

interface WeekRowProps {
  row: WeekRowModel
  monthIso: string
  today: string
  selectedDay: string
  onSelectDay: (iso: string) => void
  hoveredTaskId: number | null
  onHoverTask: (taskId: number | null) => void
}

export function WeekRow({
  row,
  monthIso,
  today,
  selectedDay,
  onSelectDay,
  hoveredTaskId,
  onHoverTask,
}: WeekRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const selectAtPoint = (e: MouseEvent) => {
    const rect = rowRef.current?.getBoundingClientRect()
    if (!rect) return
    const col = Math.min(6, Math.max(0, Math.floor((e.clientX - rect.left) / (rect.width / 7))))
    onSelectDay(row.cells[col] ?? row.cells[0]!)
  }

  return (
    <div ref={rowRef} className="relative">
      <div className="grid grid-cols-7">
        {row.cells.map((iso, i) => (
          <DayCell
            key={iso}
            iso={iso}
            dayNum={Number(iso.slice(8, 10))}
            isCurrentMonth={isSameMonth(iso, monthIso)}
            isToday={iso === today}
            isSelected={iso === selectedDay}
            weekday={i}
            overflowCount={row.overflowByDay[i] ?? 0}
            onSelect={() => onSelectDay(iso)}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-7 grid grid-cols-7 gap-y-0.5">
        {row.segments.map((seg) => (
          <TaskBar
            key={`${seg.task.id}-${seg.colStart}`}
            segment={seg}
            onSelect={selectAtPoint}
            hovered={seg.task.id === hoveredTaskId}
            onHover={onHoverTask}
          />
        ))}
      </div>
    </div>
  )
}

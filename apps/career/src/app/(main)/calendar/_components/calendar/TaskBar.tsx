import { cn } from '@bconnect/ui'
import type { MouseEvent } from 'react'
import { barColor } from '@/lib/task-colors'
import type { BarSegment } from '@/app/(main)/calendar/_lib/types'

interface TaskBarProps {
  segment: BarSegment
  onSelect: (e: MouseEvent) => void
  hovered: boolean
  onHover: (taskId: number | null) => void
}

/** 작업 바 */
export function TaskBar({ segment, onSelect, hovered, onHover }: TaskBarProps) {
  const { task, colStart, colSpan, lane, continuesLeft, continuesRight } = segment
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHover(task.id)}
      onMouseLeave={() => onHover(null)}
      style={{ gridColumn: `${colStart + 1} / span ${colSpan}`, gridRow: lane + 1 }}
      className={cn(
        'pointer-events-auto mx-px flex h-[21px] cursor-pointer items-center overflow-hidden px-1.5 text-left text-[10px] font-medium transition-[filter]',
        barColor(task.colorIndex),
        hovered && 'brightness-95',
        continuesLeft ? 'rounded-l-none' : 'rounded-l-sm',
        continuesRight ? 'rounded-r-none' : 'rounded-r-sm'
      )}
    >
      <span className="truncate">{task.title}</span>
    </button>
  )
}

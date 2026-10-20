import type { BoardPosition, BoardRow } from './types'

export interface BoardOverlayProps {
  rows: BoardRow[]
  position: BoardPosition
  size?: 'sm' | 'md'
  className?: string
}

const POSITION_CLASS: Record<BoardPosition, string> = {
  tl: 'top-2 left-2',
  tr: 'top-2 right-2',
  bl: 'bottom-2 left-2',
  br: 'bottom-2 right-2',
}

export function BoardOverlay({ rows, position, size = 'sm', className }: BoardOverlayProps) {
  const visible = rows.filter((r) => r.key || r.value)
  if (visible.length === 0) return null
  const textCls = size === 'md' ? 'text-xs' : 'text-[10px]'
  return (
    <div
      className={`pointer-events-none absolute ${POSITION_CLASS[position]} max-w-[80%] rounded-sm bg-black/55 px-2 py-1 text-white ${textCls} ${className ?? ''}`}
    >
      {visible.map((r, i) => (
        <p key={i} className="leading-snug">
          {r.key && <span className="font-semibold">{r.key} </span>}
          <span>{r.value}</span>
        </p>
      ))}
    </div>
  )
}

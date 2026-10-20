'use client'

import type { PointerEvent } from 'react'
import { useRef, useState } from 'react'

export type DragMode = 'move' | 'resize-start' | 'resize-end'

const DRAG_THRESHOLD_PX = 4

export function useBarDrag(
  dayWidth: number,
  onCommit: (mode: DragMode, deltaDays: number) => void,
  onTap?: () => void
) {
  const [drag, setDrag] = useState<{ mode: DragMode; deltaDays: number } | null>(null)
  const originX = useRef(0)
  const activated = useRef(false)

  function handleDown(mode: DragMode, e: PointerEvent<HTMLElement>) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    originX.current = e.clientX
    activated.current = false
    setDrag({ mode, deltaDays: 0 })
  }

  function handleMove(e: PointerEvent<HTMLElement>) {
    const deltaX = e.clientX - originX.current
    if (!activated.current && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return
    activated.current = true
    const deltaDays = Math.round(deltaX / dayWidth)
    setDrag((prev) => (prev && prev.deltaDays !== deltaDays ? { ...prev, deltaDays } : prev))
  }

  function handleUp() {
    if (drag) {
      if (activated.current && drag.deltaDays !== 0) onCommit(drag.mode, drag.deltaDays)
      else if (!activated.current) onTap?.()
    }
    activated.current = false
    setDrag(null)
  }

  function handleCancel() {
    activated.current = false
    setDrag(null)
  }

  return {
    drag,
    moveHandleProps: {
      onPointerDown: (e: PointerEvent<HTMLElement>) => handleDown('move', e),
      onPointerMove: handleMove,
      onPointerUp: handleUp,
      onPointerCancel: handleCancel,
    },
    startHandleDown: (e: PointerEvent<HTMLElement>) => handleDown('resize-start', e),
    endHandleDown: (e: PointerEvent<HTMLElement>) => handleDown('resize-end', e),
  }
}

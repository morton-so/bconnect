'use client'

import { useEffect, useMemo, useRef } from 'react'

export interface DebouncedCallback<A extends unknown[]> {
  (...args: A): void
  flush: () => void
  cancel: () => void
}

export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delayMs: number
): DebouncedCallback<A> {
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingArgsRef = useRef<A | null>(null)

  const debounced = useMemo(() => {
    const invoke = () => {
      const args = pendingArgsRef.current
      if (args) {
        pendingArgsRef.current = null
        fnRef.current(...args)
      }
    }
    const clear = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const call = (...args: A) => {
      pendingArgsRef.current = args
      clear()
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        invoke()
      }, delayMs)
    }
    call.flush = () => {
      clear()
      invoke()
    }
    call.cancel = () => {
      clear()
      pendingArgsRef.current = null
    }
    return call
  }, [delayMs])

  useEffect(() => () => debounced.flush(), [debounced])

  return debounced
}

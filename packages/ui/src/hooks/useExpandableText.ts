'use client'

import { useEffect, useRef, useState, type DependencyList } from 'react'

type Axis = 'height' | 'width'

export function useExpandableText(deps: DependencyList, axis: Axis = 'height') {
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [truncated, setTruncated] = useState(false)

  useEffect(() => {
    if (expanded) return
    const el = ref.current
    if (!el) return
    setTruncated(
      axis === 'height' ? el.scrollHeight > el.clientHeight + 1 : el.scrollWidth > el.clientWidth
    )
  }, [expanded, axis, ...deps])

  return {
    ref,
    expanded,
    truncated,
    showToggle: expanded || truncated,
    toggle: () => setExpanded((v) => !v),
  }
}

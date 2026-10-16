'use client'

import { useEffect, useRef, useState } from 'react'
import { Folder as FolderIcon } from 'lucide-react'

export interface FolderRowEditorProps {
  initialTitle?: string
  onSubmit: (title: string) => void
  onCancel: () => void
  placeholder?: string
}

export function FolderRowEditor({
  initialTitle = '',
  onSubmit,
  onCancel,
  placeholder = '폴더 이름',
}: FolderRowEditorProps) {
  const [value, setValue] = useState(initialTitle)
  const ref = useRef<HTMLInputElement>(null)
  const settled = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    el.select()
  }, [])

  const cancel = () => {
    if (settled.current) return
    settled.current = true
    onCancel()
  }
  const submit = () => {
    if (settled.current) return
    const t = value.trim()
    if (!t) {
      cancel()
      return
    }
    settled.current = true
    onSubmit(t)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3.5">
      <FolderIcon size={20} className="shrink-0 text-gray-500" aria-hidden />
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          }
        }}
        onBlur={submit}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
      />
    </div>
  )
}

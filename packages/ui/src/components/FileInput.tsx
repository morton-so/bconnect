/**
 * @figma-todo 파일 입력 디자인 미정
 */
'use client'

import { useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { XIcon } from '../icons/XIcon'

export type FileValue = File | string

export interface FileInputProps {
  value: FileValue | FileValue[] | null
  onChange: (value: FileValue | FileValue[] | null) => void
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  label?: string
  disabled?: boolean
  className?: string
  invalid?: boolean
  inputId?: string
  describedBy?: string
  onBlur?: () => void
  fieldRef?: React.Ref<HTMLButtonElement>
}

const toItems = (value: FileInputProps['value']): FileValue[] =>
  value == null ? [] : Array.isArray(value) ? value : [value]

const nameOf = (it: FileValue): string =>
  it instanceof File ? it.name : decodeURIComponent(it.split('/').pop() ?? it)

const sizeOf = (it: FileValue): string | null => {
  if (!(it instanceof File)) return null
  const { size } = it
  if (size < 1024) return `${size}B`
  const kb = size / 1024
  return kb < 1024 ? `${Math.round(kb)}KB` : `${(kb / 1024).toFixed(1)}MB`
}

/**
 * TODO: presign 흐름 확정 시 제출 시점에 File → URL 변환만 끼운다.
 */
export function FileInput({
  value,
  onChange,
  multiple,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = 'image/*,application/pdf',
  label = '파일 업로드',
  disabled,
  className,
  invalid,
  inputId,
  describedBy,
  onBlur,
  fieldRef,
}: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const items = toItems(value)

  const openPicker = () => fileInputRef.current?.click()

  const addFiles = (picked: File[]) => {
    if (picked.length === 0) return
    const maxBytes = maxSizeMB * 1024 * 1024
    const accepted = picked.filter((f) => f.size <= maxBytes)
    setLocalError(
      accepted.length < picked.length ? `개당 ${maxSizeMB}MB 이하만 첨부할 수 있어요.` : null
    )
    if (accepted.length === 0) return
    onChange(multiple ? [...items, ...accepted].slice(0, maxFiles) : accepted[0])
  }

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    addFiles(picked)
  }

  const removeAt = (index: number) => {
    onChange(multiple ? items.filter((_, i) => i !== index) : null)
    setLocalError(null)
  }

  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      onChange={handlePick}
      className="sr-only"
      tabIndex={-1}
      aria-hidden
    />
  )

  const canAddMore = multiple ? items.length < maxFiles : items.length === 0

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {hiddenInput}

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((it, i) => (
            <li
              key={i}
              className={cn(
                'flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2.5',
                invalid && 'border-destructive'
              )}
            >
              <div className="flex min-w-0 items-baseline gap-2">
                <span className="truncate text-r-14 text-gray-900">{nameOf(it)}</span>
                {sizeOf(it) && (
                  <span className="shrink-0 text-r-12 text-gray-500">{sizeOf(it)}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                disabled={disabled}
                aria-label={`${nameOf(it)} 삭제`}
                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors outline-none hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XIcon size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {canAddMore && (
        <button
          ref={fieldRef}
          type="button"
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          onBlur={onBlur}
          onClick={openPicker}
          disabled={disabled}
          className={cn(
            'inline-flex h-[50px] w-full cursor-pointer items-center justify-center rounded-lg border border-primary bg-transparent text-sm font-semibold text-primary transition-all outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-gray-100 disabled:text-gray-400',
            invalid && 'border-destructive text-destructive'
          )}
        >
          {items.length > 0 ? '파일 추가' : label}
        </button>
      )}

      {localError && (
        <p role="alert" className="text-r-12 text-destructive">
          {localError}
        </p>
      )}
    </div>
  )
}

/**
 * @figma-todo 이미지 입력 디자인 미정
 */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { ImageIcon } from '../icons'
import { XIcon } from '../icons/XIcon'

export type ImageValue = File | string

export interface ImageInputProps {
  value: ImageValue | ImageValue[] | null
  onChange: (value: ImageValue | ImageValue[] | null) => void
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  disabled?: boolean
  className?: string
  invalid?: boolean
  inputId?: string
  describedBy?: string
  onBlur?: () => void
  fieldRef?: React.Ref<HTMLButtonElement>
}

const toItems = (value: ImageInputProps['value']): ImageValue[] =>
  value == null ? [] : Array.isArray(value) ? value : [value]

const TRIGGER_BASE =
  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-gray-100 text-gray-500 outline-none transition-colors enabled:hover:bg-gray-200 enabled:hover:text-gray-600 focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50'

/** TODO presign 흐름이 확정되면 제출 시점에 File → URL 변환 끼우기 */
export function ImageInput({
  value,
  onChange,
  multiple,
  maxFiles = 10,
  maxSizeMB = 5,
  accept = 'image/*',
  disabled,
  className,
  invalid,
  inputId,
  describedBy,
  onBlur,
  fieldRef,
}: ImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const items = toItems(value)

  const previews = useMemo(() => {
    const map = new Map<File, string>()
    for (const it of toItems(value)) {
      if (it instanceof File) map.set(it, URL.createObjectURL(it))
    }
    return map
  }, [value])

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  const srcOf = (it: ImageValue): string | undefined =>
    typeof it === 'string' ? it : previews.get(it)

  const openPicker = () => fileInputRef.current?.click()

  const addFiles = (picked: File[]) => {
    if (picked.length === 0) return
    const maxBytes = maxSizeMB * 1024 * 1024
    const accepted = picked.filter((f) => f.type.startsWith('image/') && f.size <= maxBytes)
    setLocalError(
      accepted.length < picked.length
        ? `이미지 파일만, 장당 ${maxSizeMB}MB 이하만 추가할 수 있어요.`
        : null
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

  const dropHandlers = disabled
    ? {}
    : {
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault()
          setDragging(true)
        },
        onDragLeave: (e: React.DragEvent) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault()
          setDragging(false)
          addFiles(Array.from(e.dataTransfer.files))
        },
      }
  const dropClass = dragging && 'rounded-lg outline outline-2 outline-dashed outline-primary'

  const triggerAria = {
    id: inputId,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    onBlur,
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

  if (!multiple) {
    const current = items[0]
    const src = current ? srcOf(current) : undefined
    return (
      <div className={cn('w-full', dropClass, className)} {...dropHandlers}>
        {hiddenInput}
        {current ? (
          <div className="relative h-50 w-full">
            <button
              {...triggerAria}
              ref={fieldRef}
              type="button"
              onClick={openPicker}
              disabled={disabled}
              aria-label="이미지 변경"
              className={cn(
                'h-full w-full cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-opacity outline-none focus-visible:ring-1 focus-visible:ring-primary enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
                invalid && 'ring-1 ring-destructive'
              )}
            >
              {src && <img src={src} alt="" className="h-full w-full object-cover" />}
            </button>
            <RemoveButton onClick={() => removeAt(0)} disabled={disabled} />
          </div>
        ) : (
          <EmptyTrigger
            {...triggerAria}
            ref={fieldRef}
            onClick={openPicker}
            disabled={disabled}
            invalid={invalid}
          />
        )}
        {localError && (
          <p role="alert" className="mt-2 text-r-14 text-destructive">
            {localError}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {hiddenInput}
      {items.length === 0 ? (
        <EmptyTrigger
          {...triggerAria}
          ref={fieldRef}
          onClick={openPicker}
          disabled={disabled}
          invalid={invalid}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((it, i) => {
            const src = srcOf(it)
            return (
              <div key={i} className="relative size-24 overflow-hidden rounded-lg bg-gray-100">
                {src && <img src={src} alt="" className="h-full w-full object-cover" />}
                <RemoveButton
                  onClick={() => removeAt(i)}
                  disabled={disabled}
                  label={`${i + 1}번째 이미지 삭제`}
                />
              </div>
            )
          })}
          <button
            {...triggerAria}
            ref={fieldRef}
            type="button"
            onClick={openPicker}
            disabled={disabled || items.length >= maxFiles}
            aria-label="이미지 추가"
            className={cn('size-24', TRIGGER_BASE, 'gap-1', invalid && 'ring-1 ring-destructive')}
          >
            <ImageIcon size={20} className="text-gray-400" />
            <span className="text-r-12">
              {items.length}/{maxFiles}
            </span>
          </button>
        </div>
      )}
      {localError && (
        <p role="alert" className="mt-2 text-r-14 text-destructive">
          {localError}
        </p>
      )}
    </div>
  )
}

function RemoveButton({
  onClick,
  disabled,
  label = '이미지 삭제',
}: {
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      aria-label={label}
      className="absolute top-2 right-2 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors outline-none hover:bg-black/70 focus-visible:ring-1 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <XIcon size={14} />
    </button>
  )
}

interface EmptyTriggerProps {
  onClick: () => void
  onBlur?: () => void
  disabled?: boolean
  invalid?: boolean
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const EmptyTrigger = ({ ref, onClick, disabled, invalid, ...aria }: EmptyTriggerProps) => (
  <button
    {...aria}
    ref={ref}
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn('h-50 w-full', TRIGGER_BASE, invalid && 'ring-1 ring-destructive')}
  >
    <ImageIcon size={28} className="text-gray-400" />
    <span className="text-r-14">이미지 추가</span>
  </button>
)

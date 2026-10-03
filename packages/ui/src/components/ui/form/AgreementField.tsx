/**
 * @figma-todo 약관 동의 필드 디자인 미정
 */
'use client'

import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { CheckIcon } from '../../../icons/CheckIcon'
import { ChevronIcon } from '../../../icons/ChevronIcon'
import { cn } from '../../../lib/utils'
import { FormField, FormItem, FormMessage } from '../shadcn/form'

export interface AgreementItem {
  key: string
  label: string
  href?: string
}

interface AgreementFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  items: AgreementItem[]
  allLabel?: string
}

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
        checked
          ? 'border-primary bg-primary text-white'
          : 'border-gray-300 bg-white text-transparent'
      )}
    >
      <CheckIcon size={14} />
    </span>
  )
}

export function AgreementField<T extends FieldValues>({
  control,
  name,
  items,
  allLabel = '약관 전체 동의',
}: AgreementFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: Record<string, boolean> = field.value ?? {}
        const allChecked = items.every((item) => value[item.key])

        const toggleAll = () => {
          field.onChange(Object.fromEntries(items.map((item) => [item.key, !allChecked])))
        }
        const toggleOne = (key: string) => {
          field.onChange({ ...value, [key]: !value[key] })
        }

        const errors = (fieldState.error ?? {}) as Record<string, { message?: string } | undefined>

        return (
          <FormItem className="gap-4 rounded-xl border border-gray-200 p-4">
            <label className="relative flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="sr-only"
              />
              <CheckMark checked={allChecked} />
              <span className="text-m-16 text-gray-900">{allLabel}</span>
            </label>

            <div className="h-px w-full bg-gray-200" />

            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const checked = !!value[item.key]
                const error = errors[item.key]?.message
                return (
                  <div key={item.key} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="relative flex cursor-pointer items-center gap-2 select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(item.key)}
                          aria-invalid={!!error}
                          className="sr-only"
                        />
                        <CheckMark checked={checked} />
                        <span className="text-r-14 text-gray-700">{item.label}</span>
                      </label>
                      {item.href && (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 items-center gap-0.5 text-r-14 text-gray-400 underline underline-offset-2"
                        >
                          보기
                          <ChevronIcon direction="right" size={16} />
                        </a>
                      )}
                    </div>
                    {error && <p className="pl-7 text-r-12 text-destructive">{error}</p>}
                  </div>
                )
              })}
            </div>
            <FormMessage className="sr-only" />
          </FormItem>
        )
      }}
    />
  )
}

/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1879-13362
 */
'use client'

import * as React from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '../../lib/utils'
import { Input } from '../Input'
import { FormField } from '../shadcn/form'
import { fieldItem, fieldLabel, fieldSlot, type FieldLayout } from './_layout'

const DATE_PICKER_RESET = cn(
  'relative',
  '[&::-webkit-calendar-picker-indicator]:absolute',
  '[&::-webkit-calendar-picker-indicator]:inset-0',
  '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
  '[&::-webkit-calendar-picker-indicator]:opacity-0'
)

interface DateRangeFieldProps<T extends FieldValues> {
  control: Control<T>
  startName: FieldPath<T>
  endName: FieldPath<T>
  label?: string
  required?: boolean
  serverError?: string
  disabled?: boolean
  layout?: FieldLayout
}

export function DateRangeField<T extends FieldValues>({
  control,
  startName,
  endName,
  label,
  required,
  serverError,
  disabled,
  layout = 'stacked',
}: DateRangeFieldProps<T>) {
  const baseId = React.useId()
  const startId = `${baseId}-start`
  const messageId = `${baseId}-message`

  return (
    <FormField
      control={control}
      name={startName}
      render={({ field: startField, fieldState: startState }) => (
        <FormField
          control={control}
          name={endName}
          render={({ field: endField, fieldState: endState }) => {
            const errorMessage = startState.error?.message ?? endState.error?.message ?? serverError
            const invalid = !!errorMessage

            return (
              <div className={cn('grid', fieldItem({ layout }))}>
                {label && (
                  <label htmlFor={startId} className={fieldLabel({ layout })}>
                    {label}
                    {required && (
                      <span className="ml-0.5 text-destructive" aria-hidden>
                        *
                      </span>
                    )}
                  </label>
                )}
                <div className={cn('flex items-center gap-2', fieldSlot({ layout }))}>
                  <Input
                    {...startField}
                    id={startId}
                    type="date"
                    size="small"
                    disabled={disabled}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? messageId : undefined}
                    className={DATE_PICKER_RESET}
                  />
                  <span aria-hidden className="shrink-0 text-r-14 text-gray-900">
                    ~
                  </span>
                  <Input
                    {...endField}
                    type="date"
                    size="small"
                    disabled={disabled}
                    aria-label={label ? `${label} 종료일` : '종료일'}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? messageId : undefined}
                    className={DATE_PICKER_RESET}
                  />
                </div>
                {errorMessage && (
                  <p
                    id={messageId}
                    className={cn('text-r-14 text-destructive', fieldSlot({ layout }))}
                  >
                    {errorMessage}
                  </p>
                )}
              </div>
            )
          }}
        />
      )}
    />
  )
}

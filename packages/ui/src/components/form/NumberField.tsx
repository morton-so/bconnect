/**
 * @figma-todo 숫자 필드 디자인 미정
 */
'use client'

import { Slot } from 'radix-ui'
import * as React from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '../../lib/utils'
import { Input } from '../Input'
import { fieldItem, fieldLabel, fieldSlot, ROW_INPUT_CLASSES, type FieldLayout } from './_layout'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '../shadcn/form'

interface NumberFieldProps<T extends FieldValues> extends Omit<
  React.ComponentProps<typeof Input>,
  'name' | 'onChange' | 'required' | 'value' | 'type'
> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  description?: string
  hint?: string
  required?: boolean
  serverError?: string
  layout?: FieldLayout
}

function NumberFieldControl({
  serverError,
  ...props
}: React.ComponentProps<typeof Slot.Root> & { serverError?: string }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  const invalid = !!error || !!serverError

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!invalid ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={invalid}
      {...props}
    />
  )
}

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  hint,
  required,
  serverError,
  className,
  inputMode = 'numeric',
  layout = 'stacked',
  ...inputProps
}: NumberFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error || !!serverError
        return (
          <FormItem className={fieldItem({ layout })}>
            {label && (
              <FormLabel className={fieldLabel({ layout })}>
                {label}
                {required && (
                  <span className="ml-0.5 text-destructive" aria-hidden>
                    *
                  </span>
                )}
              </FormLabel>
            )}
            {description && (
              <FormDescription className={cn('text-r-14 text-gray-500', fieldSlot({ layout }))}>
                {description}
              </FormDescription>
            )}
            <NumberFieldControl serverError={serverError}>
              <Input
                {...field}
                {...inputProps}
                type="text"
                inputMode={inputMode}
                value={field.value ?? ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, '')
                  field.onChange(digits === '' ? undefined : Number(digits))
                }}
                className={cn(
                  layout === 'row' && ROW_INPUT_CLASSES,
                  fieldSlot({ layout }),
                  className
                )}
              />
            </NumberFieldControl>
            <FormMessage className={fieldSlot({ layout })}>{serverError}</FormMessage>
            {hint && !hasError && (
              <p className={cn('text-r-14 text-gray-500', fieldSlot({ layout }))}>{hint}</p>
            )}
          </FormItem>
        )
      }}
    />
  )
}

/**
 * @figma-todo 여러 줄 텍스트 필드 디자인 미정
 */
'use client'

import * as React from 'react'
import { Slot } from 'radix-ui'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '../../lib/utils'
import { FIELD_BASE_CLASSES, FIELD_DEFAULT_VARIANT_CLASSES } from '../constants'
import { fieldItem, fieldLabel, fieldSlot, ROW_INPUT_CLASSES, type FieldLayout } from './_layout'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '../shadcn/form'

interface TextareaFieldProps<T extends FieldValues> extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'name' | 'onChange' | 'required'
> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  description?: string
  hint?: string
  required?: boolean
  serverError?: string
  transform?: (raw: string) => string
  layout?: FieldLayout
}

/** TODO 향후 SelectField 등 추가되어 셋 이상 되면 helper 로 추출. */
function TextareaFieldControl({
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

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  hint,
  required,
  serverError,
  transform,
  className,
  rows = 4,
  layout = 'stacked',
  ...textareaProps
}: TextareaFieldProps<T>) {
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
              <FormDescription className={cn('text-r-14 text-gray-700', fieldSlot({ layout }))}>
                {description}
              </FormDescription>
            )}
            <TextareaFieldControl serverError={serverError}>
              <textarea
                {...field}
                {...textareaProps}
                rows={layout === 'row' ? 1 : rows}
                onChange={
                  transform ? (e) => field.onChange(transform(e.target.value)) : field.onChange
                }
                className={cn(
                  FIELD_BASE_CLASSES,
                  FIELD_DEFAULT_VARIANT_CLASSES,
                  layout === 'row'
                    ? cn('resize-none', ROW_INPUT_CLASSES, fieldSlot({ layout }))
                    : 'flex resize-y',
                  className
                )}
              />
            </TextareaFieldControl>
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

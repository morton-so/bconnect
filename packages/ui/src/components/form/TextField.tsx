/**
 * @figma-todo 텍스트 필드 코드 전용
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

interface TextFieldProps<T extends FieldValues> extends Omit<
  React.ComponentProps<typeof Input>,
  'name' | 'onChange' | 'required'
> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  description?: string
  hint?: string
  required?: boolean
  serverError?: string
  rightElement?: React.ReactNode
  transform?: (raw: string) => string
  layout?: FieldLayout
}

function TextFieldControl({
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

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  hint,
  required,
  serverError,
  rightElement,
  transform,
  className,
  layout = 'stacked',
  ...inputProps
}: TextFieldProps<T>) {
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
            <div className={cn('relative', fieldSlot({ layout }))}>
              <TextFieldControl serverError={serverError}>
                <Input
                  {...field}
                  {...inputProps}
                  value={field.value ?? ''}
                  onChange={
                    transform ? (e) => field.onChange(transform(e.target.value)) : field.onChange
                  }
                  className={cn(
                    layout === 'row' && ROW_INPUT_CLASSES,
                    rightElement && 'pr-28',
                    className
                  )}
                />
              </TextFieldControl>
              {rightElement && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">{rightElement}</div>
              )}
            </div>
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

/**
 * @figma-todo 선택 필드 코드 전용
 */
'use client'

import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '../shadcn/form'
import { Select, type SelectOption, type SelectProps } from '../Select'
import { cn } from '../../lib/utils'
import { fieldItem, fieldLabel, fieldSlot, type FieldLayout } from './_layout'

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  options: SelectOption[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
  fitContent?: boolean
  className?: string
  label?: string
  description?: string
  hint?: string
  required?: boolean
  serverError?: string
  layout?: FieldLayout
}

type RHFFieldArg = {
  value: string | string[]
  onChange: (v: string | string[]) => void
  onBlur: () => void
  ref: React.Ref<{ focus(): void }>
}

function SelectFieldControl({
  field,
  serverError,
  ...rest
}: {
  field: RHFFieldArg
  serverError?: string
} & Pick<
  SelectProps,
  'options' | 'multiple' | 'placeholder' | 'disabled' | 'fitContent' | 'className'
>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  const invalid = !!error || !!serverError
  return (
    <Select
      {...rest}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      fieldRef={field.ref}
      invalid={invalid}
      triggerId={formItemId}
      describedBy={invalid ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`}
    />
  )
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  hint,
  required,
  serverError,
  options,
  multiple,
  placeholder,
  disabled,
  fitContent,
  className,
  layout = 'stacked',
}: SelectFieldProps<T>) {
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
            <SelectFieldControl
              field={field as unknown as RHFFieldArg}
              serverError={serverError}
              options={options}
              multiple={multiple}
              placeholder={placeholder}
              disabled={disabled}
              fitContent={fitContent}
              className={cn(fieldSlot({ layout }), className)}
            />
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

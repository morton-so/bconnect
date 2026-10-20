/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1879-13379
 */
'use client'

import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '../../lib/utils'
import { FilterChip } from '../FilterChip'
import { Select, type SelectOption } from '../Select'
import { FormField, FormItem, FormLabel, FormMessage, useFormField } from '../shadcn/form'
import { fieldItem, fieldLabel, fieldSlot, type FieldLayout } from './_layout'

interface TagSelectFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  options: SelectOption[]
  label?: string
  placeholder?: string
  required?: boolean
  serverError?: string
  disabled?: boolean
  layout?: FieldLayout
}

type RHFTagsFieldArg = {
  value: string[] | undefined
  onChange: (v: string[]) => void
  onBlur: () => void
}

function TagSelectControl({
  field,
  serverError,
  options,
  placeholder,
  disabled,
}: {
  field: RHFTagsFieldArg
  serverError?: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  const invalid = !!error || !!serverError
  return (
    <Select
      multiple
      options={options}
      value={field.value ?? []}
      onChange={(v) => field.onChange(Array.isArray(v) ? v : [v])}
      onBlur={field.onBlur}
      placeholder={placeholder ?? '선택'}
      disabled={disabled}
      fitContent
      invalid={invalid}
      triggerId={formItemId}
      describedBy={invalid ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`}
    />
  )
}

export function TagSelectField<T extends FieldValues>({
  control,
  name,
  options,
  label,
  placeholder,
  required,
  serverError,
  disabled,
  layout = 'stacked',
}: TagSelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const values: string[] = Array.isArray(field.value) ? field.value : []
        const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v
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
            <div className={cn('flex flex-wrap items-center gap-1.5', fieldSlot({ layout }))}>
              {values.map((v) => (
                <FilterChip
                  key={v}
                  label={labelOf(v)}
                  onRemove={() => field.onChange(values.filter((x) => x !== v))}
                  className="bg-[#f4f4f4] text-[#7b7b7b]"
                />
              ))}
              <TagSelectControl
                field={field as unknown as RHFTagsFieldArg}
                serverError={serverError}
                options={options}
                placeholder={placeholder}
                disabled={disabled}
              />
            </div>
            <FormMessage className={fieldSlot({ layout })}>{serverError}</FormMessage>
          </FormItem>
        )
      }}
    />
  )
}

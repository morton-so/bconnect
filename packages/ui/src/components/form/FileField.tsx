/**
 * @figma-todo 파일 필드 코드 전용
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
import { FileInput, type FileInputProps, type FileValue } from '../FileInput'

interface FileFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  label?: string
  disabled?: boolean
  className?: string
  description?: string
  hint?: string
  required?: boolean
  serverError?: string
  triggerLabel?: string
}

type RHFFieldArg = {
  value: FileValue | FileValue[] | null
  onChange: (v: FileValue | FileValue[] | null) => void
  onBlur: () => void
  ref: React.Ref<HTMLButtonElement>
}

function FileFieldControl({
  field,
  serverError,
  triggerLabel,
  ...rest
}: {
  field: RHFFieldArg
  serverError?: string
  triggerLabel?: string
} & Pick<
  FileInputProps,
  'multiple' | 'maxFiles' | 'maxSizeMB' | 'accept' | 'disabled' | 'className'
>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  const invalid = !!error || !!serverError
  return (
    <FileInput
      {...rest}
      label={triggerLabel}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      fieldRef={field.ref}
      invalid={invalid}
      inputId={formItemId}
      describedBy={invalid ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`}
    />
  )
}

export function FileField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  hint,
  required,
  serverError,
  triggerLabel,
  multiple,
  maxFiles,
  maxSizeMB,
  accept,
  disabled,
  className,
}: FileFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error || !!serverError
        return (
          <FormItem className="gap-3">
            {label && (
              <FormLabel className="text-m-16 text-gray-900">
                {label}
                {required && (
                  <span className="ml-0.5 text-destructive" aria-hidden>
                    *
                  </span>
                )}
              </FormLabel>
            )}
            {description && (
              <FormDescription className="text-r-14 text-gray-500">{description}</FormDescription>
            )}
            <FileFieldControl
              field={field as unknown as RHFFieldArg}
              serverError={serverError}
              triggerLabel={triggerLabel}
              multiple={multiple}
              maxFiles={maxFiles}
              maxSizeMB={maxSizeMB}
              accept={accept}
              disabled={disabled}
              className={className}
            />
            <FormMessage>{serverError}</FormMessage>
            {hint && !hasError && <p className="text-r-14 text-gray-500">{hint}</p>}
          </FormItem>
        )
      }}
    />
  )
}

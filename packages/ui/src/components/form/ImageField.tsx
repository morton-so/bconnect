/**
 * @figma-todo 이미지 필드 코드 전용
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
import { ImageInput, type ImageInputProps, type ImageValue } from '../ImageInput'

interface ImageFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  disabled?: boolean
  className?: string
  label?: string
  description?: string
  hint?: string
  required?: boolean
  serverError?: string
}

type RHFFieldArg = {
  value: ImageValue | ImageValue[] | null
  onChange: (v: ImageValue | ImageValue[] | null) => void
  onBlur: () => void
  ref: React.Ref<HTMLButtonElement>
}

function ImageFieldControl({
  field,
  serverError,
  ...rest
}: {
  field: RHFFieldArg
  serverError?: string
} & Pick<
  ImageInputProps,
  'multiple' | 'maxFiles' | 'maxSizeMB' | 'accept' | 'disabled' | 'className'
>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  const invalid = !!error || !!serverError
  return (
    <ImageInput
      {...rest}
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

export function ImageField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  hint,
  required,
  serverError,
  multiple,
  maxFiles,
  maxSizeMB,
  accept,
  disabled,
  className,
}: ImageFieldProps<T>) {
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
            <ImageFieldControl
              field={field as unknown as RHFFieldArg}
              serverError={serverError}
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

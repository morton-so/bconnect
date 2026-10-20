/**
 * @figma-todo 폼 제출 버튼 코드 전용
 */
'use client'

import { useFormContext, useFormState } from 'react-hook-form'
import { Button, type ButtonProps } from '../Button'

interface FormSubmitButtonProps extends Omit<ButtonProps, 'type'> {
  isLoading?: boolean
  requireValid?: boolean
}

export function FormSubmitButton({
  isLoading,
  disabled,
  requireValid = true,
  children,
  ...rest
}: FormSubmitButtonProps) {
  const formContext = useFormContext()
  if (!formContext) {
    throw new Error('<FormSubmitButton> must be used inside <Form> (FormProvider).')
  }
  const { isValid, isSubmitting } = useFormState({ control: formContext.control })
  return (
    <Button
      type="submit"
      isLoading={isLoading ?? isSubmitting}
      disabled={disabled || (requireValid && !isValid)}
      {...rest}
    >
      {children}
    </Button>
  )
}

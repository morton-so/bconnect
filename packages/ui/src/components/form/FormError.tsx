/**
 * @figma-todo 폼 에러 메시지 코드 전용
 */
import { cn } from '../../lib/utils'

interface FormErrorProps {
  error?: string
  className?: string
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null
  return (
    <p role="alert" className={cn('text-sm text-destructive', className)}>
      {error}
    </p>
  )
}

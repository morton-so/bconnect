/**
 * @figma-todo 스켈레톤 shadcn 원본 이식
 */
import * as React from 'react'
import { cn } from '../../../lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-gray-100', className)}
      {...props}
    />
  )
}

export { Skeleton }

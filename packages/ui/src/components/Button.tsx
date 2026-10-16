/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=187-607
 */
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-gray-100 disabled:font-medium disabled:text-gray-400',
  {
    variants: {
      variant: {
        primary: 'bg-primary font-semibold text-white hover:bg-primary-600',
        secondary: 'bg-gray-100 font-medium text-gray-500',
        outline:
          'border border-primary bg-transparent font-semibold text-primary hover:bg-primary/10',
        ghost: 'border border-gray-500 bg-transparent font-medium text-gray-500',
        destructive:
          'border border-destructive bg-transparent font-semibold text-destructive hover:bg-destructive/10',
        text: 'bg-transparent text-gray-700 hover:bg-gray-100',
      },
      size: {
        default: 'h-[50px] w-90 px-4',
        sm: 'h-10 w-[206px] px-3',
        small: 'h-7 rounded-md px-3 text-r-12',
        full: 'h-[50px] w-full px-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
  isLoading?: boolean
  asChild?: boolean
}

/**
 * 버튼 컴포넌트 (Morton 디자인 시스템)
 *
 * @example
 * ```tsx
 * // Primary (활성)
 * <Button variant="primary">다음</Button>
 *
 * // Secondary (비활성)
 * <Button variant="secondary">다음</Button>
 *
 * // Outline (활성_stroke)
 * <Button variant="outline">다음</Button>
 *
 * // Ghost (비활성_stroke)
 * <Button variant="ghost">다음</Button>
 *
 * // Small size
 * <Button size="sm">다음</Button>
 *
 * // Full width
 * <Button size="full">다음</Button>
 *
 * // 링크로 동작 (semantic <a href>) — asChild 로 자식 <Link> 에 스타일 합성
 * <Button asChild variant="primary">
 *   <Link href="/login">로그인</Link>
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, isLoading, disabled, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const content = isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
        {children}
      </>
    ) : (
      children
    )
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

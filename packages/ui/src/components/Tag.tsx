/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=188-1010
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'
import { XIcon } from '../icons/XIcon'

const tagVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-lg border text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-transparent font-medium text-gray-400 hover:border-gray-300',
        selected: 'border-primary bg-secondary font-semibold text-primary',
        filter: 'gap-1 border-primary bg-secondary font-semibold text-primary',
      },
      size: {
        default: 'h-10 px-3.5 py-[3px]',
        // small
        sm: 'h-8 px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface TagProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof tagVariants> {
  children?: React.ReactNode
  onRemove?: () => void
}

/**
 * Figma: https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=188-1010
 */
const Tag = React.forwardRef<HTMLButtonElement, TagProps>(
  ({ className, variant, size, children, onRemove, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === 'filter' && onRemove) {
        onRemove()
      }
      onClick?.(e)
    }

    return (
      <button
        type="button"
        className={cn(tagVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
        {variant === 'filter' && <XIcon size={16} />}
      </button>
    )
  }
)
Tag.displayName = 'Tag'

export { Tag, tagVariants }

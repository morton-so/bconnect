/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=189-626
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'
import {
  FIELD_BASE_CLASSES,
  FIELD_DEFAULT_VARIANT_CLASSES,
  FIELD_ERROR_VARIANT_CLASSES,
} from './constants'

/**
 * Figma: https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=189-626
 *        size=small https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1879-13366
 */
const inputVariants = cva(`${FIELD_BASE_CLASSES} flex items-center`, {
  variants: {
    variant: {
      default: FIELD_DEFAULT_VARIANT_CLASSES,
      error: FIELD_ERROR_VARIANT_CLASSES,
    },
    size: {
      default: 'h-[50px]',
      small: 'h-[33px] py-0 text-r-14',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, errorMessage, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(inputVariants({ variant, size, className }))}
        {...props}
      />
    )

    if (errorMessage) {
      return (
        <div className="flex w-full flex-col items-start gap-2">
          {inputElement}
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )
    }

    return inputElement
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }

/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1504-14190
 */
import * as React from 'react'
import { ChevronIcon } from '../../icons'
import { cn } from '../../lib/utils'

export interface NotificationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  picture?: string
  message: string
  createdAt: string
  read?: boolean
  href?: string
}

const NotificationItem = React.forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ className, picture, message, createdAt, read = false, href, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full cursor-pointer items-start gap-3 border-b border-[#F4F4F4] bg-white px-5 py-3.5 transition-colors hover:bg-gray-50',
          className
        )}
        {...props}
      >
        <span
          className={cn('mt-2 size-1.5 shrink-0 rounded-[3px] bg-primary-500', read && 'opacity-0')}
          aria-hidden
        />
        <div className="size-9 shrink-0 overflow-hidden rounded-full bg-[#E5E5E5]">
          {picture && <img src={picture} alt="" className="size-full object-cover" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              'leading-[1.6]!',
              read ? 'text-r-14 text-[#7B7B7B]' : 'text-sb-14 text-[#1B1B1B]'
            )}
          >
            {message}
          </span>
          <span className="text-r-12 text-[#A5A5A5]">{createdAt}</span>
        </div>
        {href && (
          <div className="flex shrink-0 items-center gap-1 self-center text-[#A5A5A5]">
            <span className="text-r-12 whitespace-nowrap">자세히 보기</span>
            <ChevronIcon direction="right" className="size-4" />
          </div>
        )}
      </div>
    )
  }
)
NotificationItem.displayName = 'NotificationItem'

export { NotificationItem }

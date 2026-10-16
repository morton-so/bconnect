/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=407-3666
 */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronIcon } from '../icons'
import { cn } from '../lib/utils'

const chatListItemVariants = cva(
  'flex w-full cursor-pointer items-center justify-between transition-colors hover:bg-gray-50',
  {
    variants: {
      variant: {
        default: 'h-[90px] border-b border-[#E5E5E5] px-4',
        badge: 'pb-5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ChatListItemProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatListItemVariants> {
  profileImage?: string
  name: string
  location?: string
  jobType?: string
  specialty?: string
  lastMessage?: string
  timestamp?: string
  unreadCount?: number
  showChevron?: boolean
}

const ChatListItem = React.forwardRef<HTMLDivElement, ChatListItemProps>(
  (
    {
      className,
      variant,
      profileImage,
      name,
      location,
      jobType,
      specialty,
      lastMessage,
      timestamp,
      unreadCount,
      showChevron = true,
      ...props
    },
    ref
  ) => {
    const isBadge = variant === 'badge'
    const tags = [location, jobType, specialty].filter(Boolean)

    return (
      <div
        ref={ref}
        className={cn(
          chatListItemVariants({ variant }),
          isBadge ? 'items-start' : 'items-center',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'flex min-w-0 flex-1',
            isBadge ? 'items-start gap-2.5' : 'items-center gap-4'
          )}
        >
          <div className="size-[50px] shrink-0 overflow-hidden rounded-full bg-[#F4F4F4]">
            {profileImage && (
              <img src={profileImage} alt={name} className="size-full object-cover" />
            )}
          </div>

          <div className={cn('flex min-w-0 flex-1 flex-col', !isBadge && 'gap-1')}>
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="shrink-0 text-sb-14 leading-[1.6]! text-[#1B1B1B]">{name}</span>
                {tags.length > 0 && (
                  <div className="flex items-center gap-2 text-m-12 text-[#A5A5A5]">
                    {tags.map((tag, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <span className="h-2 w-px shrink-0 bg-gray-300" aria-hidden />
                        )}
                        <span>{tag}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              {isBadge && timestamp && (
                <span className="shrink-0 text-m-12 text-[#A5A5A5]">{timestamp}</span>
              )}
            </div>

            {lastMessage && (
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    'min-w-0 flex-1 text-[#1B1B1B]',
                    isBadge ? 'truncate text-m-14' : 'line-clamp-2 text-r-12'
                  )}
                >
                  {lastMessage}
                </span>
                {isBadge && unreadCount != null && unreadCount > 0 && (
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-[8px] bg-[#FF4242]">
                    <span className="text-[12px] leading-none font-bold text-white">
                      {unreadCount}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!isBadge && showChevron && (
          <ChevronIcon direction="right" className="size-4 shrink-0 text-[#A5A5A5]" />
        )}
      </div>
    )
  }
)
ChatListItem.displayName = 'ChatListItem'

export { ChatListItem, chatListItemVariants }

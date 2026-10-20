/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=189-720
 */
'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import * as React from 'react'
import { ChevronIcon, FilterIcon, ChatIcon, NotificationIcon } from '../icons'
import { cn } from '../lib/utils'
import { TitleCountBadge } from './TitleCountBadge'

const topBarVariants = cva('sticky top-0 z-40 flex h-15 w-full items-center bg-white px-4', {
  variants: {
    variant: {
      progress: 'justify-between',
      default: 'relative justify-between',
      home: 'justify-between',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function CountBadge({ count }: { count?: number }) {
  if (count === undefined || count <= 0) return null
  return (
    <div className="absolute -top-[3.5px] -right-[7.5px] flex min-w-[15px] items-center justify-center rounded-full bg-destructive px-1">
      <span className="text-[10px] leading-[15px] font-bold text-white">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  )
}

function ChatBadgeIcon({ count }: { count?: number }) {
  return (
    <div className="relative size-5">
      <ChatIcon className="text-[#a5a5a5]" />
      <CountBadge count={count} />
    </div>
  )
}

function NotifyBadgeIcon({ count }: { count?: number }) {
  return (
    <div className="relative size-5">
      <NotificationIcon className="text-[#a5a5a5]" />
      <CountBadge count={count} />
    </div>
  )
}

const iconButtonClass =
  'flex h-15 cursor-pointer items-center justify-center transition-all hover:opacity-60 active:scale-[0.95]'

function UtilityIcons({
  notifyHref,
  notifyCount,
  chatHref,
  chatCount,
}: {
  notifyHref?: string
  notifyCount?: number
  chatHref?: string
  chatCount?: number
}) {
  return (
    <div className="flex items-center">
      {notifyHref && (
        <Link href={notifyHref} className={cn(iconButtonClass, 'pr-2 pl-4')} aria-label="알림">
          <NotifyBadgeIcon count={notifyCount} />
        </Link>
      )}
      {chatHref && (
        <Link href={chatHref} className={cn(iconButtonClass, '-mr-4 pr-4 pl-2')} aria-label="채팅">
          <ChatBadgeIcon count={chatCount} />
        </Link>
      )}
    </div>
  )
}

function ProgressBarInline({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex h-[3px] w-[330px] gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn('h-full flex-1 rounded-full', i < step ? 'bg-primary' : 'bg-gray-300')}
        />
      ))}
    </div>
  )
}

export interface TopBarProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof topBarVariants> {
  step?: number
  totalSteps?: number
  title?: string
  titleCount?: number
  rightSlot?: React.ReactNode
  leftSlot?: React.ReactNode
  actionText?: string
  onAction?: () => void
  actionDisabled?: boolean
  actionIcon?: React.ReactNode
  actionIconLabel?: string
  actionHref?: string
  showBack?: boolean
  leftIcon?: React.ReactNode
  leftHref?: string
  onLeft?: () => void
  leftLabel?: string
  chatCount?: number
  notifyCount?: number
  onFilter?: () => void
  onBack?: () => void
  backHref?: string
  chatHref?: string
  notifyHref?: string
}

const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  (
    {
      className,
      variant = 'default',
      step = 1,
      totalSteps = 3,
      title,
      titleCount,
      rightSlot,
      leftSlot,
      actionText,
      onAction,
      actionDisabled = false,
      actionIcon,
      actionIconLabel,
      actionHref,
      showBack = true,
      leftIcon,
      leftHref,
      onLeft,
      leftLabel,
      chatCount,
      notifyCount,
      onFilter,
      onBack,
      backHref,
      chatHref,
      notifyHref,
      ...props
    },
    ref
  ) => {
    const backButtonClass =
      'flex size-5 cursor-pointer items-center justify-center transition-all hover:opacity-60 active:scale-[0.95]'
    const hasUtility = !!(chatHref || notifyHref)

    const BackButton = !showBack ? (
      <div className="size-5" />
    ) : backHref ? (
      <Link href={backHref} className={backButtonClass} aria-label="뒤로가기">
        <ChevronIcon direction="left" className="text-[#a5a5a5]" />
      </Link>
    ) : (
      <button type="button" onClick={onBack} className={backButtonClass} aria-label="뒤로가기">
        <ChevronIcon direction="left" className="text-[#a5a5a5]" />
      </button>
    )

    const LeftSlot = leftSlot ? (
      leftSlot
    ) : !leftIcon ? (
      BackButton
    ) : leftHref ? (
      <Link
        href={leftHref}
        className={cn(iconButtonClass, '-ml-4 pr-2 pl-4')}
        aria-label={leftLabel}
      >
        {leftIcon}
      </Link>
    ) : (
      <button
        type="button"
        onClick={onLeft}
        className={cn(iconButtonClass, '-ml-4 pr-2 pl-4')}
        aria-label={leftLabel}
      >
        {leftIcon}
      </button>
    )

    return (
      <header ref={ref} className={cn(topBarVariants({ variant, className }))} {...props}>
        {variant === 'progress' && (
          <>
            {BackButton}
            <ProgressBarInline step={step} total={totalSteps} />
            <div className="size-5" />
          </>
        )}
        {variant === 'default' && (
          <>
            {LeftSlot}
            <div className="pointer-events-none absolute left-1/2 flex max-w-[60%] -translate-x-1/2 items-center gap-2">
              <p className="truncate text-center text-sb-16 text-gray-900">{title}</p>
              <TitleCountBadge count={titleCount} />
            </div>
            {rightSlot ? (
              rightSlot
            ) : hasUtility ? (
              <UtilityIcons
                notifyHref={notifyHref}
                notifyCount={notifyCount}
                chatHref={chatHref}
                chatCount={chatCount}
              />
            ) : actionIcon ? (
              actionHref ? (
                <Link
                  href={actionHref}
                  className={cn(iconButtonClass, '-mr-4 pr-4 pl-2 text-gray-900')}
                  aria-label={actionIconLabel}
                >
                  {actionIcon}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onAction}
                  className={cn(iconButtonClass, '-mr-4 pr-4 pl-2 text-gray-900')}
                  aria-label={actionIconLabel}
                >
                  {actionIcon}
                </button>
              )
            ) : actionText ? (
              <button
                type="button"
                onClick={onAction}
                disabled={actionDisabled}
                className={cn(
                  'text-sb-16',
                  actionDisabled
                    ? 'cursor-default text-gray-400'
                    : 'text-primary hover:cursor-pointer'
                )}
              >
                {actionText}
              </button>
            ) : (
              <div className="size-5" />
            )}
          </>
        )}
        {variant === 'home' && (
          <>
            <button
              type="button"
              onClick={onFilter}
              className={cn(iconButtonClass, '-ml-4 px-4')}
              aria-label="필터"
            >
              <FilterIcon className="text-[#a5a5a5]" />
            </button>
            <div className="flex-1" />
            <UtilityIcons
              notifyHref={notifyHref}
              notifyCount={notifyCount}
              chatHref={chatHref}
              chatCount={chatCount}
            />
          </>
        )}
      </header>
    )
  }
)
TopBar.displayName = 'TopBar'

export { TopBar, topBarVariants }

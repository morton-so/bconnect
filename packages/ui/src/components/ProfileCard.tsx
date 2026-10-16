/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=407-3666
 */
'use client'

import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '../lib/utils'
import { ChevronIcon } from '../icons/ChevronIcon'
import { useExpandableText } from '../hooks/useExpandableText'
import { Skeleton } from './shadcn/skeleton'

export interface ProfileCardMeta {
  region: string
  trade: string
  role?: string
}

export interface ProfileCardProps {
  avatarUrl: string
  name: string
  meta: ProfileCardMeta
  description?: string
  href?: string
  profileHref?: string
  rightSlot?: ReactNode
  /**
   * rightSlot 세로 정렬. 기본 'start'(위 정렬) — 설명 2줄로 커지는 카드의 케밥용.
   * 'center' — 설명 없는 컴팩트 행(동료요청 수락/거절 등)에서 버튼을 세로 가운데로.
   */
  rightSlotAlign?: 'start' | 'center'
  as?: 'div' | 'li'
  className?: string
}

export function ProfileCard({
  avatarUrl,
  name,
  meta,
  description,
  href,
  profileHref,
  rightSlot,
  rightSlotAlign = 'start',
  as: Root = 'div',
  className,
}: ProfileCardProps) {
  const { ref, expanded, showToggle, toggle } = useExpandableText([description], 'height')

  const metaItems = [meta.region, meta.role, meta.trade].filter(Boolean) as string[]

  return (
    <Root
      className={cn(
        'relative flex items-center gap-3 border-b border-[#E5E5E5] py-3',
        href && 'transition-colors hover:bg-gray-50 active:bg-gray-100',
        className
      )}
    >
      {href && (
        <Link
          href={href}
          aria-label={name}
          className="absolute inset-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
        />
      )}

      <div className="flex min-w-0 flex-1 items-center gap-4">
        {profileHref ? (
          <Link href={profileHref} aria-label={name} className="relative z-10 shrink-0">
            <img
              src={avatarUrl}
              alt={name}
              className="size-[50px] rounded-full bg-gray-100 object-cover"
            />
          </Link>
        ) : (
          <img
            src={avatarUrl}
            alt={name}
            className="size-[50px] shrink-0 rounded-full bg-gray-100 object-cover"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2.5">
            {profileHref ? (
              <Link href={profileHref} className="relative z-10 shrink-0 text-sb-14 text-gray-900">
                {name}
              </Link>
            ) : (
              <span className="shrink-0 text-sb-14 text-gray-900">{name}</span>
            )}
            {metaItems.length > 0 && (
              <div className="flex min-w-0 items-center gap-2">
                {metaItems.map((item, i) => (
                  <Fragment key={i}>
                    {i > 0 && <span className="h-2 w-px shrink-0 bg-gray-300" aria-hidden />}
                    <span className="truncate text-m-12 text-[#A5A5A5]">{item}</span>
                  </Fragment>
                ))}
              </div>
            )}
          </div>
          {description && (
            <div className="flex flex-col items-start gap-0.5">
              <p
                ref={ref}
                className={cn(
                  'text-left text-r-12 whitespace-pre-wrap text-gray-900',
                  !expanded && 'line-clamp-2'
                )}
              >
                {description}
              </p>
              {showToggle && (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={expanded}
                  className="relative z-10 cursor-pointer text-r-12 text-[#A5A5A5] underline"
                >
                  {expanded ? '접기' : '더보기'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {rightSlot ? (
        <div
          className={cn(
            'relative z-10 shrink-0',
            rightSlotAlign === 'center' ? 'self-center' : 'self-start'
          )}
        >
          {rightSlot}
        </div>
      ) : href ? (
        <ChevronIcon direction="right" size={16} className="shrink-0 text-gray-400" />
      ) : null}
    </Root>
  )
}

export interface ProfileCardSkeletonProps {
  as?: 'div' | 'li'
  className?: string
}

export function ProfileCardSkeleton({ as: Root = 'div', className }: ProfileCardSkeletonProps) {
  return (
    <Root className={cn('flex items-center gap-4 border-b border-[#E5E5E5] py-3', className)}>
      <Skeleton className="size-[50px] shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </Root>
  )
}

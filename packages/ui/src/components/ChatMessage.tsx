/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=364-4504
 */
import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const chatBubbleVariants = cva('inline-flex items-center rounded-xl px-4 text-r-14', {
  variants: {
    variant: {
      mine: 'bg-primary py-[9px] text-white',
      theirs: 'bg-gray-100 py-3 text-gray-900',
      typing: 'h-10 bg-gray-100 py-[9px]',
    },
    /** 꼬리(각진 모서리) — 그룹 첫 메시지만 갖는다 */
    hasTail: { true: '', false: '' },
  },
  compoundVariants: [
    { variant: 'mine', hasTail: true, class: 'rounded-tr-none' },
    { variant: 'theirs', hasTail: true, class: 'rounded-tl-none' },
    { variant: 'typing', hasTail: true, class: 'rounded-tl-none' },
  ],
  defaultVariants: {
    variant: 'mine',
    hasTail: true,
  },
})

export interface ChatMessageImage {
  id: number
  url: string
  alt?: string
}

export interface ChatMessageProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof chatBubbleVariants>, 'hasTail'> {
  message?: string
  images?: ChatMessageImage[]
  timestamp?: string
  profileImage?: string
  nickname?: string
  /** 주어지면 프로필 이미지가 해당 프로필로 가는 Link (theirs, typing) */
  profileHref?: string
  /**
   * 같은 분 그룹의 후속 메시지 — 프로필·닉네임을 숨기고(자리는 유지) 꼬리도 없앤다.
   * 카톡처럼 두 번째 메시지부터 모서리가 전부 둥글어진다.
   */
  grouped?: boolean
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      className,
      variant,
      message,
      images,
      timestamp,
      profileImage,
      nickname,
      profileHref,
      grouped = false,
      ...props
    },
    ref
  ) => {
    const hasImages = (images?.length ?? 0) > 0
    const bubbleClass = chatBubbleVariants({ variant, hasTail: !grouped })
    const avatarClass = cn(
      'size-10 shrink-0 overflow-hidden rounded-full',
      !grouped && 'bg-gray-100'
    )
    const avatarImage = !grouped && profileImage && (
      <img src={profileImage} alt={nickname || ''} className="size-full object-cover" />
    )

    if (variant === 'mine') {
      return (
        <div ref={ref} className={cn('flex items-end justify-end gap-2', className)} {...props}>
          {timestamp && <span className="shrink-0 text-r-12 text-gray-700">{timestamp}</span>}
          {hasImages ? (
            <ImageGrid images={images ?? []} />
          ) : (
            <div className={cn(bubbleClass, 'max-w-[55vw]')}>
              <span className="break-words">{message}</span>
            </div>
          )}
        </div>
      )
    }

    // theirs & typing 공통 레이아웃
    return (
      <div ref={ref} className={cn('flex items-start gap-2', className)} {...props}>
        {/* 프로필 이미지 — 그룹 후속 메시지는 자리만. href 주면 프로필로 이동 */}
        {profileHref && !grouped ? (
          <Link
            href={profileHref}
            aria-label={nickname ? `${nickname} 프로필 보기` : '프로필 보기'}
            className={cn(
              avatarClass,
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none'
            )}
          >
            {avatarImage}
          </Link>
        ) : (
          <div className={avatarClass} aria-hidden={grouped}>
            {avatarImage}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex max-w-[55vw] flex-col gap-1">
            {!grouped && nickname && <span className="text-m-12 text-gray-900">{nickname}</span>}
            {hasImages && variant !== 'typing' ? (
              <ImageGrid images={images ?? []} />
            ) : (
              <div className={bubbleClass}>
                {variant === 'typing' ? (
                  <TypingDots />
                ) : (
                  <span className="break-words">{message}</span>
                )}
              </div>
            )}
          </div>
          {variant === 'theirs' && timestamp && (
            <span className="shrink-0 text-r-12 text-gray-700">{timestamp}</span>
          )}
        </div>
      </div>
    )
  }
)
ChatMessage.displayName = 'ChatMessage'

function ImageGrid({ images, className }: { images: ChatMessageImage[]; className?: string }) {
  const isSingle = images.length === 1
  return (
    <div className={cn('grid w-max gap-1', isSingle ? 'grid-cols-1' : 'grid-cols-2', className)}>
      {images.map((image) => (
        <img
          key={image.id}
          src={image.url}
          alt={image.alt ?? '사진'}
          className={cn(
            'rounded-xl bg-gray-100 object-cover',
            isSingle ? 'max-h-60 max-w-full min-w-28' : 'size-28'
          )}
        />
      ))}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }}
        />
      ))}
    </div>
  )
}

export { ChatMessage, chatBubbleVariants }

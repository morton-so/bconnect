/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=352-2767
 */
'use client'

import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { SquarePen, Trash2 } from 'lucide-react'
import { MoreVerticalIcon } from '../icons'
import { useExpandableText } from '../hooks'
import { cn } from '../lib/utils'
import { ImageCarousel } from './ImageCarousel'

const feedVariants = cva('flex flex-col items-stretch gap-3', {
  variants: {
    variant: {
      collapsed: '',
      expanded: '',
    },
  },
  defaultVariants: {
    variant: 'collapsed',
  },
})

export interface FeedProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>, VariantProps<typeof feedVariants> {
  content: {
    images: string[]
    imageAlt?: string
    company?: string
    duration?: string
    timestamp: string
    description: string
  }
  canManage?: boolean
  editHref?: string
  onDelete?: () => void
}

export const Feed = React.forwardRef<HTMLDivElement, FeedProps>(
  ({ className, content, canManage = false, editHref, onDelete, variant, ...props }, ref) => {
    const {
      ref: textRef,
      expanded: isExpanded,
      showToggle,
      toggle: handleToggle,
    } = useExpandableText([content.description], 'width')
    const [menuOpen, setMenuOpen] = React.useState(false)

    const effectiveVariant = isExpanded ? 'expanded' : 'collapsed'

    return (
      <div
        ref={ref}
        className={cn(feedVariants({ variant: effectiveVariant }), 'w-full', className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {content.company && <p className="text-r-12 text-gray-700">{content.company}</p>}
            {content.company && content.duration && <div className="h-[13px] w-px bg-gray-300" />}
            {content.duration && <p className="text-r-12 text-gray-700">{content.duration}</p>}
          </div>
          <div className="flex items-center gap-1">
            <p className="text-r-12 text-gray-700">{content.timestamp}</p>
            {canManage && (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="shrink-0 cursor-pointer p-1 text-[#434343]"
                aria-label="게시물 관리"
              >
                <MoreVerticalIcon size={16} />
              </button>
            )}
          </div>
        </div>

        <ImageCarousel images={content.images} alt={content.imageAlt || content.description} />

        <div
          className={cn(
            'flex w-full',
            isExpanded ? 'flex-col items-end justify-center' : 'items-center gap-2'
          )}
        >
          <p
            ref={textRef}
            className={cn(
              'text-m-16 text-gray-900',
              isExpanded
                ? 'w-[min-content] min-w-full leading-[1.6] whitespace-pre-wrap'
                : 'min-w-0 flex-1 truncate leading-[25.2px]'
            )}
          >
            {content.description}
          </p>
          {showToggle && (
            <button
              type="button"
              onClick={handleToggle}
              className={cn(
                'shrink-0 cursor-pointer text-r-12 text-gray-700 underline decoration-solid hover:text-gray-900',
                isExpanded ? 'leading-[25.2px]' : ''
              )}
            >
              {isExpanded ? '접기' : '더보기'}
            </button>
          )}
        </div>

        {canManage && (
          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
              <Dialog.Content
                aria-describedby={undefined}
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] focus:outline-none"
              >
                <Dialog.Title className="sr-only">게시물 관리</Dialog.Title>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1 w-9 rounded-full bg-gray-300" />
                </div>
                <div className="flex flex-col py-2">
                  {editHref && (
                    <Link
                      href={editHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-m-16 text-gray-900 hover:bg-gray-50"
                    >
                      <SquarePen size={20} />
                      수정
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete?.()
                    }}
                    className="flex items-center gap-3 px-5 py-3.5 text-m-16 text-gray-900 hover:bg-gray-50"
                  >
                    <Trash2 size={20} />
                    삭제
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
    )
  }
)

Feed.displayName = 'Feed'

export { feedVariants }

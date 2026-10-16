'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ActionDrawer,
  cn,
  EditIcon,
  ImageCarousel,
  MoreVerticalIcon,
  TrashIcon,
  useExpandableText,
} from '@bconnect/ui'

interface WorkCardProps {
  images: string[]
  imageAlt?: string
  company?: string
  duration?: string
  timestamp: string
  description: string
  editHref?: string
  onDelete?: () => void
}

export function WorkCard({
  images,
  imageAlt,
  company,
  duration,
  timestamp,
  description,
  editHref,
  onDelete,
}: WorkCardProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const { ref, expanded, showToggle, toggle } = useExpandableText([description], 'width')

  const canManage = !!editHref || !!onDelete

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {company && <span className="truncate text-r-12 text-gray-500">{company}</span>}
          {company && duration && <div className="h-[13px] w-px shrink-0 bg-gray-300" />}
          {duration && <span className="shrink-0 text-r-12 text-gray-500">{duration}</span>}
        </div>
        <div className="flex items-center gap-2">
          {timestamp && <span className="text-r-12 text-gray-500">{timestamp}</span>}
          {canManage && (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="작업물 메뉴"
              className="flex h-6 w-6 cursor-pointer items-center justify-center text-gray-500"
            >
              <MoreVerticalIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <ImageCarousel
          images={images}
          alt={imageAlt || description}
          imageClassName="rounded-none bg-gray-100"
        />
      )}

      <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
        <div className={cn('flex w-full', expanded ? 'flex-col items-end' : 'items-center gap-2')}>
          <p
            ref={ref}
            className={cn(
              'text-m-16 text-gray-900',
              expanded ? 'w-full whitespace-pre-wrap' : 'min-w-0 flex-1 truncate'
            )}
          >
            {description}
          </p>
          {showToggle && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={expanded}
              className="shrink-0 cursor-pointer text-r-12 leading-[25.2px] text-gray-700 underline hover:text-gray-900"
            >
              {expanded ? '접기' : '더보기'}
            </button>
          )}
        </div>
      </div>

      <ActionDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        items={[
          ...(editHref
            ? [
                {
                  label: '수정',
                  icon: <EditIcon size={18} />,
                  onSelect: () => router.push(editHref),
                },
              ]
            : []),
          ...(onDelete
            ? [
                {
                  label: '삭제',
                  icon: <TrashIcon size={18} />,
                  destructive: true,
                  onSelect: onDelete,
                },
              ]
            : []),
        ]}
      />
    </div>
  )
}

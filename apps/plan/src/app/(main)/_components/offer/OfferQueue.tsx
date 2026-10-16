/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1572-13227
 */
'use client'

import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import Link from 'next/link'
import { OfferStatus, type Offer } from '@bconnect/api-client'
import { Button, ConfirmDialog, SearchIcon, toast } from '@bconnect/ui'
import { useOfferQueue } from '@/hooks/useOfferQueue'
import { usePanelNav } from '@/hooks/usePanelNav'
import { OfferQueueRow } from './OfferQueueRow'

function EmptyState({ actionHref }: { actionHref?: string }) {
  return (
    <div className="flex flex-col items-center pt-8 pb-4">
      <div className="flex size-[140px] items-center justify-center rounded-full bg-secondary">
        <SearchIcon size={72} className="text-primary" />
      </div>
      <p className="mt-4 text-r-14 text-gray-600">기술자를 탐색하고 섭외해보세요</p>
      {actionHref && (
        <Button asChild className="mt-4 w-full">
          <Link href={actionHref}>기술자 탐색</Link>
        </Button>
      )}
    </div>
  )
}

export function OfferQueue({
  taskId,
  emptyActionHref,
}: {
  taskId: number
  emptyActionHref?: string
}) {
  const { items, removeFromQueue, reorderQueue } = useOfferQueue(taskId)
  const { panelHref } = usePanelNav()
  const [pending, setPending] = useState<Offer | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (items.length === 0) return <EmptyState actionHref={emptyActionHref} />

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) reorderQueue(Number(active.id), Number(over.id))
  }

  const isOffered = pending?.status === OfferStatus.ACTIVE

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={items.map((i) => i.member.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col">
            {items.map((item) => (
              <OfferQueueRow
                key={item.member.id}
                item={item}
                profileHref={panelHref(`profile/${item.member.id}`, { task: String(taskId) })}
                onRequestRemove={setPending}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="mt-2 text-r-12 text-gray-500">
        * 이미 섭외 요청이 발송된 경우 섭외 순서를 조정할 수 없어요
      </p>

      {emptyActionHref && (
        <Button
          asChild
          variant="outline"
          className="mt-4 h-[33.5px] w-full rounded-[6px] border-[#c0d0ff] px-0 text-m-14 font-medium hover:bg-primary-50"
        >
          <Link href={emptyActionHref}>기술자 탐색</Link>
        </Button>
      )}

      <ConfirmDialog
        open={pending != null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        title={isOffered ? '섭외를 취소할까요?' : '대기열에서 삭제할까요?'}
        description="섭외 대기열에서 제거돼요."
        confirmLabel={isOffered ? '섭외 취소' : '삭제'}
        destructive
        onConfirm={() => {
          if (pending) {
            removeFromQueue(pending.member.id)
            toast({
              description: isOffered ? '섭외를 취소했어요' : '대기열에서 삭제했어요',
              variant: 'success',
            })
          }
          setPending(null)
        }}
      />
    </div>
  )
}

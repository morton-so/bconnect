'use client'

import { useState } from 'react'
import { Button, ConfirmDialog, toast } from '@bconnect/ui'
import { useOfferQueue } from '@/hooks/useOfferQueue'

export function OfferProposeButton({
  taskId,
  profileId,
  disabled,
}: {
  taskId: number
  profileId: number
  disabled?: boolean
}) {
  const { isQueued, addToQueue, removeFromQueue } = useOfferQueue(taskId)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isQueued(profileId)) {
    return (
      <>
        <Button
          variant="outline"
          size="full"
          className="h-10 border-destructive text-destructive hover:bg-destructive/5"
          onClick={() => setConfirmOpen(true)}
        >
          섭외 취소
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="섭외를 취소할까요?"
          description="섭외 대기열에서 제거돼요."
          confirmLabel="섭외 취소"
          destructive
          onConfirm={() => {
            removeFromQueue(profileId)
            toast({ description: '섭외를 취소했어요', variant: 'success' })
            setConfirmOpen(false)
          }}
        />
      </>
    )
  }

  return (
    <Button
      variant="outline"
      size="full"
      className="h-10"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        addToQueue(profileId)
        toast({ description: '섭외 대기열에 추가했어요', variant: 'success' })
      }}
    >
      섭외 제안하기
    </Button>
  )
}

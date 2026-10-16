'use client'

import { useMemo } from 'react'
import {
  getGetProjectTasksQueryKey,
  getGetTaskOffersQueryKey,
  OfferStatus,
  useCancelOffer,
  useCreateOffer,
  useGetTaskOffers,
  useQueryClient,
  useReorderOffers,
} from '@bconnect/api-client'
import type { Offer } from '@bconnect/api-client'
import { DRAFT_TASK_ID, toOfferQueue } from '@/lib/schedule/task-helpers'
import { useAllProjectTasks } from '@/hooks/useAllProjectTasks'

export function useOfferQueue(taskId: number | null | undefined) {
  const queryClient = useQueryClient()
  const numId = taskId != null && taskId !== DRAFT_TASK_ID ? taskId : null
  const enabled = numId != null
  const { data: offers, isLoading } = useGetTaskOffers(numId ?? 0, { query: { enabled } })
  const { tasks } = useAllProjectTasks()
  const task = numId != null ? tasks.find((t) => t.id === numId) : undefined

  const items = useMemo(() => toOfferQueue(offers ?? []), [offers])

  const invalidate = () => {
    if (numId == null) return
    queryClient.invalidateQueries({ queryKey: getGetTaskOffersQueryKey(numId) })
    if (task)
      queryClient.invalidateQueries({ queryKey: getGetProjectTasksQueryKey(task.projectId) })
  }

  const { mutate: createOffer, isPending: isCreating } = useCreateOffer({
    mutation: { onSettled: invalidate },
  })
  const { mutate: cancelOffer, isPending: isCanceling } = useCancelOffer({
    mutation: { onSettled: invalidate },
  })
  const { mutate: reorderOffers, isPending: isReordering } = useReorderOffers({
    mutation: {
      onError: invalidate,
      onSuccess: invalidate,
    },
  })

  const findOffer = (profileId: number) => items.find((o) => o.member?.id === profileId)

  return {
    items,
    count: items.length,
    isPending: isLoading || isCreating || isCanceling || isReordering,
    isQueued: (profileId: number) => items.some((o) => o.member?.id === profileId),
    addToQueue: (profileId: number) => {
      if (numId == null || !task) return
      createOffer({
        data: { taskId: numId, workerId: profileId },
      })
    },
    removeFromQueue: (profileId: number) => {
      const offer = findOffer(profileId)
      if (offer?.id != null) cancelOffer({ id: offer.id })
    },
    reorderQueue: (activeProfileId: number, overProfileId: number) => {
      if (numId == null || activeProfileId === overProfileId) return
      const pending = items.filter((o) => o.status === OfferStatus.PENDING)
      const from = pending.findIndex((o) => o.member?.id === activeProfileId)
      const to = pending.findIndex((o) => o.member?.id === overProfileId)
      if (from < 0 || to < 0) return
      const next = pending.slice()
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      const offerIds = next.flatMap((o) => o.id ?? [])
      if (offerIds.length !== pending.length) return
      const active = items.filter((o) => o.status === OfferStatus.ACTIVE)
      const activeMax = Math.max(0, ...active.map((o) => o.seq ?? 0))
      queryClient.setQueryData<Offer[]>(getGetTaskOffersQueryKey(numId), [
        ...active,
        ...next.map((o, i) => ({ ...o, seq: activeMax + 1 + i })),
      ])
      reorderOffers({ data: { offerIds } })
    },
  }
}

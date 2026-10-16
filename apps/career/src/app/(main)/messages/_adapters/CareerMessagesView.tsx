'use client'

import { useCallback, useMemo } from 'react'
import {
  OfferStatus,
  useAcceptOffer,
  useDenyOffer,
  useQueries,
  useQueryClient,
  useGetDirectChats,
  useGetGroupChats,
  useGetMyMember,
  useGetProfile,
  useGetTasks,
  getGetOfferQueryKey,
  getGetOfferQueryOptions,
  getGetProfileQueryOptions,
  getGetTasksQueryKey,
} from '@bconnect/api-client'
import type { Offer, Profile, TaskList } from '@bconnect/api-client'
import {
  MessagesView,
  ChatView,
  toChatSummaries,
  useChatImageUpload,
  useChatOfferIds,
  type MessagesViewData,
  type ChatViewData,
  type OfferMessageDetail,
  type OfferMessageEntry,
} from '@bconnect/features'
import { serverErrorMessage, toast, TopBar } from '@bconnect/ui'

export function CareerMessagesList() {
  const { data: me, isLoading: isMeLoading } = useGetMyMember()
  const currentUserId = me?.id
  const dm = useGetDirectChats()
  const group = useGetGroupChats()
  const allChats = useMemo(() => toChatSummaries(dm.data, group.data), [dm.data, group.data])

  const otherMemberIds = useMemo(() => {
    const ids = new Set<number>()
    for (const chat of allChats) {
      const other = chat.members.find((p) => p.id !== currentUserId)
      if (other?.id != null) ids.add(other.id)
    }
    return [...ids]
  }, [allChats, currentUserId])

  const profileQueries = useQueries({
    queries: otherMemberIds.map((id) => ({
      ...getGetProfileQueryOptions(id),
      enabled: otherMemberIds.length > 0,
    })),
  })

  const profileMap = useMemo(() => {
    const map = new Map<number, Profile>()
    profileQueries.forEach((q, i) => {
      if (q.data) map.set(otherMemberIds[i], q.data)
    })
    return map
  }, [profileQueries, otherMemberIds])

  const data: MessagesViewData = {
    chats: allChats,
    currentUserId,
    profileMap,
    isLoading: isMeLoading || dm.isLoading || group.isLoading,
    isError: dm.isError || group.isError,
  }

  return (
    <MessagesView
      data={data}
      chatHref={(chatId) => `/messages/${chatId}`}
      renderShell={({ title, children }) => (
        <div className="flex flex-col">
          <TopBar variant="default" title={title} backHref="/" />
          {children}
        </div>
      )}
    />
  )
}

export function CareerChatRoom({ chatId }: { chatId: number }) {
  const currentUserId = useGetMyMember().data?.id
  // TODO: 단건 조회 엔드포인트 부재 → DM 목록에서 filter.
  const { data: directChats, isLoading, isError } = useGetDirectChats()
  const chat = useMemo(
    () => toChatSummaries(directChats).find((c) => c.id === chatId),
    [directChats, chatId]
  )
  const otherId = chat?.members.find((p) => p.id !== currentUserId)?.id
  const { data: otherProfile } = useGetProfile(otherId ?? 0, {
    query: { enabled: otherId != null },
  })

  const queryClient = useQueryClient()
  // 수락/거절 직후의 낙관적 갱신 — 로컬 state 대신 캐시에 직접 쓴다. state 로 덮으면 이후
  // 서버가 내려주는 상태 변경(업체 취소 등)까지 세션 내내 가려진다.
  const applyOfferStatus = useCallback(
    (offerId: number, status: OfferStatus) => {
      queryClient.setQueryData<TaskList>(getGetTasksQueryKey(), (prev) =>
        prev == null
          ? prev
          : {
              ...prev,
              assigneeTasks: prev.assigneeTasks.map((task) =>
                task.offer?.id === offerId ? { ...task, offer: { ...task.offer, status } } : task
              ),
            }
      )
      queryClient.setQueryData<Offer>(getGetOfferQueryKey(offerId), (prev) =>
        prev == null ? prev : { ...prev, status }
      )
    },
    [queryClient]
  )

  // OFFER 메시지의 offerId를 배정 작업과 연결해 카드 상세를 만든다.
  const { data: tasks, isLoading: isTasksLoading, isError: isTasksError } = useGetTasks()
  const taskOfferDetails = useMemo(() => {
    const map = new Map<number, OfferMessageDetail>()
    for (const task of tasks?.assigneeTasks ?? []) {
      const offer = task.offer
      if (offer?.id == null) continue
      map.set(offer.id, {
        offerId: offer.id,
        status: offer.status,
        start: task.start,
        end: task.end,
        address: task.address ?? undefined,
        trades: task.trades,
        requirement: task.requirement ?? undefined,
      })
    }
    return map
  }, [tasks])

  // 작업 목록에서 빠진 종료 섭외는 단건 조회로 상태만 보완한다.
  const offerIds = useChatOfferIds(chatId)
  const missingOfferIds = useMemo(
    () => (tasks == null ? [] : offerIds.filter((id) => !taskOfferDetails.has(id))),
    [tasks, offerIds, taskOfferDetails]
  )
  const closedOfferQueries = useQueries({
    queries: missingOfferIds.map((id) => getGetOfferQueryOptions(id)),
  })

  // 조회 결과를 섭외별로 담는다 — 로딩·실패가 방 전체 공용이면 무관한 조회 실패가 모든 카드를
  // 오류로 뒤집고, 반대로 실패를 빼면 상세가 원래 없는 종료 섭외와 구분되지 않는다.
  const offers = useMemo(() => {
    const map = new Map<number, OfferMessageEntry>()
    for (const id of offerIds) {
      const detail = taskOfferDetails.get(id)
      if (detail) {
        map.set(id, { detail })
        continue
      }
      if (isTasksLoading) {
        map.set(id, { isLoading: true })
        continue
      }
      if (isTasksError) {
        map.set(id, { isError: true })
        continue
      }
      // 작업 목록에서 빠진 섭외(종료됐거나 내 배정이 아닌 건)는 단건 조회가 상태만 채운다.
      const query = closedOfferQueries[missingOfferIds.indexOf(id)]
      if (query?.isLoading) map.set(id, { isLoading: true })
      else if (query?.isError) map.set(id, { isError: true })
      else if (query?.data) map.set(id, { detail: { offerId: id, status: query.data.status } })
      else map.set(id, {})
    }
    return map
  }, [
    offerIds,
    taskOfferDetails,
    isTasksLoading,
    isTasksError,
    missingOfferIds,
    closedOfferQueries,
  ])

  // 무효화(수락/거절 → getTasks·getTaskOffers)는 orval mutationInvalidates 가 자동 처리 (ADR-0025)
  const accept = useAcceptOffer<Error>({
    mutation: {
      onSuccess: (_data, variables) => {
        applyOfferStatus(variables.id, OfferStatus.ACCEPTED)
        toast({ description: '섭외를 수락했어요', variant: 'success' })
      },
      onError: (error) => toast({ description: serverErrorMessage(error), variant: 'error' }),
    },
  })
  const deny = useDenyOffer<Error>({
    mutation: {
      onSuccess: (_data, variables) => {
        applyOfferStatus(variables.id, OfferStatus.DENIED)
        toast({ description: '섭외를 거절했어요', variant: 'success' })
      },
      onError: (error) => toast({ description: serverErrorMessage(error), variant: 'error' }),
    },
  })
  const pendingOfferId =
    (accept.isPending ? accept.variables?.id : undefined) ??
    (deny.isPending ? deny.variables?.id : undefined) ??
    null
  const pendingAction = accept.isPending ? 'accept' : deny.isPending ? 'deny' : null
  const isOfferActionPending = pendingAction != null

  // 상대방이 변경한 섭외 상태는 소켓 수신 시 다시 조회한다.
  const handleOfferMessage = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() })
    // 작업 목록에서 빠진 섭외의 상세는 단건 조회 캐시에서 읽는다 — 같이 무효화하지 않으면
    // 만료·취소 후에도 옛 ACTIVE 가 남아 카드가 수락/거절 버튼을 계속 띄운다.
    for (const id of offerIds) queryClient.invalidateQueries({ queryKey: getGetOfferQueryKey(id) })
  }, [queryClient, offerIds])

  const data: ChatViewData = {
    chat,
    currentUserId,
    otherProfile,
    offers,
    isLoading,
    isError,
  }

  const imageUpload = useChatImageUpload(chatId)

  return (
    <ChatView
      chatId={chatId}
      data={data}
      profileHref={(id) => `/profile/${id}`}
      imageActions={{
        upload: imageUpload.upload,
        isUploading: imageUpload.isUploading,
        progress: imageUpload.progress,
        onSendError: imageUpload.notifySendError,
      }}
      onOfferMessage={handleOfferMessage}
      offerActions={{
        onAccept: (offerId) => {
          if (isOfferActionPending) return
          accept.mutate({ id: offerId })
        },
        onDeny: (offerId) => {
          if (isOfferActionPending) return
          deny.mutate({ id: offerId })
        },
        // 처리 중엔 모든 섭외 버튼을 잠그고, 해당 카드의 해당 버튼만 loading 표시한다.
        pendingOfferId,
        pendingAction,
      }}
      renderShell={({ title, children }) => (
        <div className="flex min-h-0 flex-1 flex-col">
          <TopBar variant="default" title={title} backHref="/messages" />
          {children}
        </div>
      )}
    />
  )
}

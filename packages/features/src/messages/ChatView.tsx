'use client'

import { useCallback, useState, type ReactNode } from 'react'
import {
  getGetDirectChatMessagesQueryKey,
  getGetDirectChatsQueryKey,
  getTradeLabel,
  useQueryClient,
  MessageType,
} from '@bconnect/api-client'
import type { CursorPageMessage, InfiniteData, Message, Profile } from '@bconnect/api-client'
import { ChatInput, ProfileCard, Skeleton } from '@bconnect/ui'
import { DEFAULT_PROFILE_IMAGE } from '@bconnect/lib/avatar'
import { PanelShell } from '../PanelShell'
import { MessageThread } from './MessageThread'
import { chatMemberName } from './types'
import { useDirectChatSocket } from './useDirectChatSocket'
import type { OfferMessageEntry } from './OfferMessageCard'
import type { ChatSummary, OfferActions } from './types'

export interface ChatViewData {
  chat?: ChatSummary
  currentUserId?: number
  otherProfile?: Profile
  /**
   * 섭외 제안(OFFER) 메시지의 조회 결과 — key = offerId. 로딩·실패도 offerId 별로 담는다.
   * 채팅 자체는 유지하고 OFFER 카드 안에서만 상태를 표시한다. 미주입이면 카드가 상세 없이 렌더.
   */
  offers?: Map<number, OfferMessageEntry>
  isLoading: boolean
  isError: boolean
}

export interface ChatImageActions {
  upload: (files: File[]) => Promise<number[]>
  isUploading?: boolean
  progress?: { done: number; total: number } | null
  onSendError?: () => void
}

type ChatViewBaseProps = {
  chatId: number
  data: ChatViewData
  profileHref?: (memberId: number) => string
  /** 섭외 제안 수락/거절 — career(기술자)만 주입. 미주입이면 카드가 읽기전용 */
  offerActions?: OfferActions
  imageActions?: ChatImageActions
  /**
   * 섭외 상태 변경(SYSTEM·OFFER 타입) 메시지 수신 시 호출 — 앱이 자신의 offer/task 쿼리를 무효화한다.
   * 상대방 액션(수락 등)은 내 세션의 React Query 캐시를 못 건드리므로, 소켓 수신을 계기로 삼는다.
   * content 문자열은 안 보고 타입만 본다 — BE 카피 문구에 의존하지 않기 위함.
   */
  onOfferMessage?: () => void
}

type ChatViewShellProps =
  | {
      renderShell: (props: { title: string; children: ReactNode }) => ReactNode
      closeHref?: never
      onClose?: never
      backHref?: never
    }
  | {
      renderShell?: never
      closeHref: string
      onClose: () => void
      backHref: string
    }

export type ChatViewProps = ChatViewBaseProps & ChatViewShellProps

export function ChatView(props: ChatViewProps) {
  const { chatId, data, profileHref, offerActions, imageActions, onOfferMessage } = props
  const { chat, currentUserId, otherProfile, offers, isLoading, isError } = data
  const other = chat?.members.find((p) => p.id !== currentUserId)
  const otherId = other?.id
  const title = chatMemberName(other) ?? chat?.title ?? '채팅'
  const profile = otherProfile

  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  const appendMessage = useCallback(
    (incoming: Message) => {
      setLocalMessages((prev) =>
        prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
      )
      queryClient.setQueryData<InfiniteData<CursorPageMessage>>(
        getGetDirectChatMessagesQueryKey(chatId),
        (prev) => {
          if (!prev) return prev
          const [newest, ...older] = prev.pages
          if (!newest) return prev
          if (prev.pages.some((page) => page.content?.some((m) => m.id === incoming.id)))
            return prev
          return {
            ...prev,
            pages: [{ ...newest, content: [incoming, ...(newest.content ?? [])] }, ...older],
          }
        }
      )
      queryClient.invalidateQueries({ queryKey: getGetDirectChatsQueryKey() })
      // 섭외 이벤트 수신 시 앱별 상세 쿼리를 갱신한다.
      if (incoming.type === MessageType.SYSTEM || incoming.type === MessageType.OFFER)
        onOfferMessage?.()
    },
    [chatId, queryClient, onOfferMessage]
  )
  const sendMessage = useDirectChatSocket(chatId, appendMessage)

  const handleSend = useCallback(() => {
    const content = message.trim()
    if (!content) return
    if (sendMessage({ type: MessageType.TEXT, content })) setMessage('')
  }, [message, sendMessage, setMessage])

  const handlePickImages = useCallback(
    async (files: File[]) => {
      if (!imageActions) return
      const attachmentIds = await imageActions.upload(files)
      if (attachmentIds.length === 0) return
      if (!sendMessage({ type: MessageType.IMAGE, attachmentIds })) imageActions.onSendError?.()
    },
    [imageActions, sendMessage]
  )

  const profilePanelHref = profileHref && otherId != null ? profileHref(otherId) : undefined
  const headerItem = (
    <ProfileCard
      className="px-4"
      avatarUrl={other?.picture || DEFAULT_PROFILE_IMAGE}
      name={title}
      meta={{
        region: profile?.address?.city ?? '',
        trade: profile?.primaryTrade ? getTradeLabel(profile.primaryTrade) : '',
      }}
      description={profile?.about ?? profile?.headline ?? undefined}
      href={profilePanelHref}
    />
  )

  const body = isLoading ? (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="ml-auto h-12 w-1/2" />
      <Skeleton className="h-12 w-3/5" />
    </div>
  ) : isError || !chat ? (
    <div className="flex flex-1 items-center justify-center px-4 text-center">
      <p className="text-r-14 text-gray-500">대화를 불러올 수 없습니다</p>
    </div>
  ) : (
    <>
      <MessageThread
        chatId={chatId}
        currentUserId={currentUserId}
        participants={chat.members}
        localMessages={localMessages}
        offers={offers}
        offerActions={offerActions}
        profileHref={profileHref}
        header={headerItem}
      />
      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        onPickImages={imageActions ? (files) => handlePickImages(files) : undefined}
        isUploading={imageActions?.isUploading}
        uploadProgress={imageActions?.progress}
      />
    </>
  )

  if (props.renderShell) {
    return <>{props.renderShell({ title, children: body })}</>
  }

  return (
    <PanelShell
      title={title}
      backHref={props.backHref}
      backLabel="메시지 목록"
      closeLabel="메시지 패널 닫기"
      closeHref={props.closeHref}
      onClose={props.onClose}
    >
      {body}
    </PanelShell>
  )
}

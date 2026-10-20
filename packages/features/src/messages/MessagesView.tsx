'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ROLE_LABELS, TRADE_LABELS } from '@bconnect/api-client'
import type { Profile } from '@bconnect/api-client'
import { ChatListItem, Skeleton } from '@bconnect/ui'
import { formatRelativeTime } from '@bconnect/lib/date'
import { PanelShell } from '../PanelShell'
import { PanelScroll } from '../PanelScroll'
import { PanelMessage } from '../PanelMessage'
import type { ChatSummary } from './types'
import { chatMemberName, chatPreviewText } from './types'

export interface MessagesViewData {
  chats?: ChatSummary[]
  currentUserId?: number
  profileMap?: Map<number, Profile>
  isLoading: boolean
  isError: boolean
}

interface MessagesViewBaseProps {
  data: MessagesViewData
  chatHref: (chatId: number) => string
}

type MessagesViewShellProps =
  | {
      renderShell: (props: { title: string; children: ReactNode }) => ReactNode
      closeHref?: never
      onClose?: never
    }
  | {
      renderShell?: never
      closeHref: string
      onClose: () => void
    }

export type MessagesViewProps = MessagesViewBaseProps & MessagesViewShellProps

export function MessagesView(props: MessagesViewProps) {
  const { data, chatHref } = props
  const { currentUserId, profileMap, isLoading, isError } = data
  const allChats = data.chats ?? []

  const body = (
    <PanelScroll>
      {isLoading ? (
        <MessagesSkeleton />
      ) : isError ? (
        <PanelMessage>메시지를 불러올 수 없습니다</PanelMessage>
      ) : allChats.length === 0 ? (
        <PanelMessage>진행 중인 대화가 없습니다</PanelMessage>
      ) : (
        <div className="flex flex-col">
          {allChats.map((chat) => {
            const otherMember = chat.members.find((p) => p.id !== currentUserId)
            const otherId = otherMember?.id
            const otherProfile = otherId != null ? profileMap?.get(otherId) : undefined
            const trade = otherProfile?.primaryTrade
              ? TRADE_LABELS[otherProfile.primaryTrade]
              : undefined
            const role = otherProfile?.role ? ROLE_LABELS[otherProfile.role] : undefined
            return (
              <Link key={chat.id} href={chatHref(chat.id)} scroll={false} className="block px-4">
                <ChatListItem
                  variant="badge"
                  profileImage={otherMember?.picture ?? undefined}
                  name={chatMemberName(otherMember) ?? chat.title ?? '채팅'}
                  jobType={trade}
                  specialty={role}
                  lastMessage={chatPreviewText(chat.lastMessage)}
                  timestamp={chat.modifiedAt ? formatRelativeTime(chat.modifiedAt) : undefined}
                  unreadCount={chat.unreadCount}
                />
              </Link>
            )
          })}
        </div>
      )}
    </PanelScroll>
  )

  if (props.renderShell) {
    return <>{props.renderShell({ title: '메시지', children: body })}</>
  }

  return (
    <PanelShell
      title="메시지"
      closeLabel="메시지 패널 닫기"
      closeHref={props.closeHref}
      onClose={props.onClose}
    >
      {body}
    </PanelShell>
  )
}

function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}

// 채팅 mock 데이터 + 인메모리 저장

import { AttachmentType, ChatType, MessageType, Role, Trade } from '@bconnect/api-client'
import {
  getGetDirectChatMessagesMockHandler,
  getGetDirectChatsMockHandler,
  getGetGroupChatsMockHandler,
  getGetMyMemberMockHandler,
} from '@bconnect/api-client/msw'
import type { DirectChat, Member, MemberSummary, Message } from '@bconnect/api-client'

const EPOCH = '2025-01-02T00:00:00.000Z'
const at = (hhmm: string) => `2025-12-04T${hhmm}:00.000Z`
const MY_ID = 1

const ME: Member = {
  id: MY_ID,
  username: 'morton_boss',
  name: '김대표',
  phone: '+821012341234',
  birth: '1988-03-17',
  marketingConsent: true,
  picture: null,
  roles: [Role.CAREER, Role.PLAN],
  createdAt: EPOCH,
  modifiedAt: EPOCH,
}

interface Worker {
  id: number
  name: string
  trade: Trade
}

const WORKERS: Worker[] = [
  { id: 101, name: '이송목', trade: Trade.WALLPAPER },
  { id: 102, name: '박전기', trade: Trade.ELECTRICAL },
  { id: 103, name: '최타일', trade: Trade.TILING },
]

const maskedOf = (w: Worker): MemberSummary => ({
  id: w.id,
  username: `worker_${w.id}`,
  name: w.name,
  picture: null,
})

const msg = (
  id: number,
  chatId: number,
  memberId: number,
  content: string,
  hhmm: string,
  type: MessageType = MessageType.TEXT
): Message => ({
  id,
  chatId,
  chatType: ChatType.DIRECT,
  memberId,
  type,
  content,
  createdAt: at(hhmm),
  modifiedAt: at(hhmm),
  attachments: [],
})

const placeholderImage = (label: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#e5e5e5"/><text x="50%" y="50%" font-size="28" fill="#a5a5a5" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  )}`

// 이미지 메시지
const imageMsg = (
  id: number,
  chatId: number,
  memberId: number,
  labels: string[],
  hhmm: string
): Message => ({
  ...msg(id, chatId, memberId, '', hhmm, MessageType.IMAGE),
  attachments: labels.map((label, i) => ({
    id: id * 10 + i,
    memberId,
    type: AttachmentType.IMAGE,
    filename: `${label}.jpg`,
    contentType: 'image/jpeg',
    size: 1_000_000,
    createdAt: at(hhmm),
    modifiedAt: at(hhmm),
    url: placeholderImage(label),
  })),
})

// 섭외 메시지
const offerMsg = (id: number, chatId: number, memberId: number, offerId: number, hhmm: string) =>
  msg(id, chatId, memberId, String(offerId), hhmm, MessageType.OFFER)

// 채팅 메시지
const MESSAGES_BY_CHAT: Record<number, Message[]> = {
  1: [
    msg(1001, 1, 101, '안녕하세요. 궁금한 점이 있어 연락드립니다.', '05:00'),
    msg(1002, 1, MY_ID, '네 안녕하세요.', '05:05'),
    msg(1003, 1, 101, '도배 작업 일정 협의 가능할까요?', '05:09'),
    msg(1004, 1, MY_ID, '다음 주 화요일부터 가능합니다.', '05:13'),
    offerMsg(1005, 1, 101, 8004, '05:20'),
  ],
  2: [
    msg(2001, 2, 102, '전기 배선 견적 문의드립니다.', '03:00'),
    imageMsg(2002, 2, 102, ['현장 1'], '03:04'),
    msg(2003, 2, MY_ID, '도면 보내주시면 확인하겠습니다.', '03:10'),
    imageMsg(2004, 2, MY_ID, ['도면 1', '도면 2', '도면 3'], '03:12'),
  ],
  3: [
    msg(3001, 3, MY_ID, '타일 시공 가능하신가요?', '01:00'),
    msg(3002, 3, 103, '네 가능합니다. 일정 알려주세요.', '01:20'),
  ],
}

const UNREAD_BY_CHAT: Record<number, number> = { 1: 2, 2: 4, 3: 1 }

const chatOf = (w: Worker, index: number): DirectChat => {
  const id = index + 1
  const messages = MESSAGES_BY_CHAT[id]
  const last = messages[messages.length - 1]
  return {
    id,
    member: maskedOf(w),
    lastMessage: last,
    unreadCount: UNREAD_BY_CHAT[id] ?? 0,
    createdAt: messages[0].createdAt,
    modifiedAt: last.createdAt,
  }
}

const CHATS: DirectChat[] = WORKERS.map(chatOf)

// 메시지 인메모리 저장
export function appendMockMessage(chatId: number, message: Message): void {
  const messages = MESSAGES_BY_CHAT[chatId]
  if (!messages) return
  messages.push(message)
  const chat = CHATS.find((c) => c.id === chatId)
  if (chat) {
    chat.lastMessage = message
    chat.modifiedAt = message.createdAt
  }
}

export const nextMockMessageId = (() => {
  let id = 9000
  return () => ++id
})()

export const MOCK_MY_ID = MY_ID

const paramId = (value: string | readonly string[] | undefined): number =>
  Number(typeof value === 'string' ? value : (value?.[0] ?? ''))

export const chatsOverrides = [
  getGetMyMemberMockHandler(() => ME),
  getGetDirectChatsMockHandler(() => CHATS),
  getGetGroupChatsMockHandler(() => []),
  getGetDirectChatMessagesMockHandler(({ params }) => {
    const id = paramId(params.id)
    const content = (MESSAGES_BY_CHAT[id] ?? []).slice().reverse()
    return { content, hasNext: false }
  }),
]

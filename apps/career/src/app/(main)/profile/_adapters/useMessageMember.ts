'use client'

import { useRouter } from 'next/navigation'
import { useCreateDirectChat } from '@bconnect/api-client'
import { serverErrorMessage, toast } from '@bconnect/ui'

/**
 * 동료에게 메시지 — 1:1 채팅방을 생성(이미 있으면 조회)하고 그 방으로 이동한다.
 * 실제 메시지 전송 REST 는 없고(WebSocket 계열), 진입은 채팅방 생성 → /messages/:id 이동.
 * 무효화는 orval mutationInvalidates 가 자동 처리 (ADR-0025).
 */
export function useMessageMember() {
  const router = useRouter()
  const chat = useCreateDirectChat<Error>({
    mutation: {
      // mutation 콜백 내 imperative 내비게이션 — no-restricted-syntax 비대상
      onSuccess: (chatId) => router.push(`/messages/${chatId}`),
      onError: (error) => toast({ description: serverErrorMessage(error), variant: 'error' }),
    },
  })

  return {
    onMessage: (memberId: number) => chat.mutate({ data: { memberId } }),
    isMessaging: chat.isPending,
  }
}

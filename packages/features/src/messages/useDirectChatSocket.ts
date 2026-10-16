'use client'

import { useCallback, useEffect, useEffectEvent, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { getAccessToken, refreshAccessToken } from '@bconnect/api-client'
import type { Message, MessageType } from '@bconnect/api-client'

export interface SendMessagePayload {
  type: MessageType
  content?: string
  attachmentIds?: number[]
}

const getWsUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  return base.replace(/^http/, 'ws') + '/ws'
}

export function useDirectChatSocket(chatId: number, onMessage: (message: Message) => void) {
  const clientRef = useRef<Client | null>(null)
  const handleMessage = useEffectEvent(onMessage)

  useEffect(() => {
    const client = new Client({
      brokerURL: getWsUrl(),
      reconnectDelay: 5000,
      beforeConnect: async () => {
        if (!getAccessToken()) await refreshAccessToken()
        client.connectHeaders = { Authorization: `Bearer ${getAccessToken() ?? ''}` }
      },
      onConnect: () => {
        client.subscribe(`/topic/direct-chats/${chatId}`, (frame) => {
          handleMessage(JSON.parse(frame.body) as Message)
        })
      },
    })
    client.activate()
    clientRef.current = client
    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [chatId])

  return useCallback(
    (payload: SendMessagePayload): boolean => {
      const client = clientRef.current
      if (!client?.connected) return false
      client.publish({
        destination: `/app/direct-chats/${chatId}/messages`,
        body: JSON.stringify(payload),
      })
      return true
    },
    [chatId]
  )
}

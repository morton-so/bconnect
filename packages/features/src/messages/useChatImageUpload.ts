'use client'

import { useCallback, useState } from 'react'
import {
  createAttachmentPresign,
  createAttachmentConfirm,
  AttachmentContext,
  AttachmentType,
} from '@bconnect/api-client'
import { serverErrorMessage, toast } from '@bconnect/ui'

export const CHAT_IMAGE_MAX_FILES = 50
export const CHAT_IMAGE_MAX_SIZE_MB = 20

const MAX_BYTES = CHAT_IMAGE_MAX_SIZE_MB * 1024 * 1024

export interface ChatImageUploadProgress {
  done: number
  total: number
}

async function uploadChatImages(
  files: File[],
  chatId: number,
  onUploaded: () => void
): Promise<number[]> {
  const presigned = await createAttachmentPresign({
    context: AttachmentContext.CHAT,
    type: AttachmentType.IMAGE,
    contextId: chatId,
    files: files.map((f) => ({ filename: f.name, contentType: f.type, size: f.size })),
  })
  await Promise.all(
    presigned.map(async (p, i) => {
      const file = files[i]
      if (!file || !p.uploadUrl) throw new Error('업로드 URL 누락')
      const res = await fetch(p.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!res.ok) throw new Error(`이미지 업로드 실패 (${res.status})`)
      onUploaded()
    })
  )
  const attachmentIds = presigned.map((p) => p.id).filter((id): id is number => id != null)
  await createAttachmentConfirm({ attachmentIds })
  return attachmentIds
}

export function useChatImageUpload(chatId: number) {
  const [progress, setProgress] = useState<ChatImageUploadProgress | null>(null)
  const isUploading = progress != null

  const upload = useCallback(
    async (files: File[]): Promise<number[]> => {
      if (isUploading) return []

      const images = files.filter((f) => f.type.startsWith('image/') && f.size <= MAX_BYTES)
      if (images.length < files.length) {
        toast({
          description: `이미지 파일만, 장당 ${CHAT_IMAGE_MAX_SIZE_MB}MB 이하만 보낼 수 있어요`,
          variant: 'error',
        })
      }
      if (images.length === 0) return []

      const targets = images.slice(0, CHAT_IMAGE_MAX_FILES)
      if (images.length > CHAT_IMAGE_MAX_FILES) {
        toast({
          description: `한 번에 ${CHAT_IMAGE_MAX_FILES}장까지 보낼 수 있어요`,
          variant: 'error',
        })
      }

      setProgress({ done: 0, total: targets.length })
      try {
        return await uploadChatImages(targets, chatId, () =>
          setProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev))
        )
      } catch (error) {
        toast({ description: serverErrorMessage(error), variant: 'error' })
        return []
      } finally {
        setProgress(null)
      }
    },
    [chatId, isUploading]
  )

  const notifySendError = useCallback(() => {
    toast({ description: '사진을 보내지 못했어요. 다시 시도해주세요', variant: 'error' })
  }, [])

  return { upload, isUploading, progress, notifySendError }
}

'use client'

import { useState } from 'react'
import {
  createAttachmentPresign,
  createAttachmentConfirm,
  useUpdateMyMemberPicture,
  useQueryClient,
  getGetMyProfileQueryKey,
  AttachmentContext,
  AttachmentType,
} from '@bconnect/api-client'
import { toast } from '@bconnect/ui'

async function uploadProfileImage(file: File, memberId: number): Promise<number> {
  const [presigned] = await createAttachmentPresign({
    context: AttachmentContext.MEMBER,
    type: AttachmentType.IMAGE,
    contextId: memberId,
    files: [{ filename: file.name, contentType: file.type, size: file.size }],
  })
  if (presigned?.id == null || !presigned.uploadUrl) throw new Error('업로드 URL 누락')
  const res = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })
  if (!res.ok) throw new Error(`이미지 업로드 실패 (${res.status})`)
  await createAttachmentConfirm({ attachmentIds: [presigned.id] })
  return presigned.id
}

export function useProfileImageUpload(memberId: number) {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)
  const updatePicture = useUpdateMyMemberPicture()

  const pickAndUpload = () => {
    if (memberId <= 0 || isUploading) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setIsUploading(true)
      try {
        const pictureId = await uploadProfileImage(file, memberId)
        await updatePicture.mutateAsync({ data: { pictureId } })
        await queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() })
        toast({ description: '프로필 이미지를 변경했어요', variant: 'success' })
      } catch (error) {
        toast({ description: (error as Error).message, variant: 'error' })
      } finally {
        setIsUploading(false)
      }
    }
    input.click()
  }

  return { pickAndUpload, isUploading }
}

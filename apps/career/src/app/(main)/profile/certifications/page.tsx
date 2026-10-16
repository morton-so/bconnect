'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useGetMyCredentials, useDeleteCredential } from '@bconnect/api-client'
import { Button, ConfirmDialog, TopBar } from '@bconnect/ui'
import { CredentialItem } from './_components/CredentialItem'

/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1239-7678
 */
export default function CertificationsPage() {
  const { data: credentials, isLoading: isCredentialsLoading } = useGetMyCredentials()

  const { mutate: deleteCredential } = useDeleteCredential()

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const credentialsList = credentials ?? []
  const isLoading = isCredentialsLoading

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <TopBar variant="default" title="자격 증명" backHref="/profile" />
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-m-14 text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <TopBar variant="default" title="자격 증명" backHref="/profile" />

      <p className="px-4 py-3 text-r-12 text-gray-500">
        자격 증명을 프로필에 표시하고 신뢰도를 높여보세요
      </p>

      {credentialsList.length > 0 ? (
        <div className="flex flex-col divide-y divide-gray-300">
          {credentialsList.map((credential) => (
            <CredentialItem
              key={credential.id}
              credential={credential}
              onRequestDelete={setPendingDeleteId}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-m-14 text-gray-500">등록된 자격 증명이 없습니다</p>
        </div>
      )}

      <div className="px-4 py-3">
        <Button asChild variant="primary" size="full">
          <Link href="/profile/certifications/apply">자격 증명 추가하기</Link>
        </Button>
      </div>

      <ConfirmDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null)
        }}
        title="자격 증명을 삭제할까요?"
        description="삭제한 자격 증명은 복구할 수 없어요."
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          if (pendingDeleteId == null) return
          deleteCredential({ id: pendingDeleteId })
        }}
      />
    </div>
  )
}

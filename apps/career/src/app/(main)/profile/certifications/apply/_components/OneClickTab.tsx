'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateOneClickValidation, type Credential } from '@bconnect/api-client'
import {
  Form,
  FormError,
  FormSubmitButton,
  TextField,
  passthroughError,
  toast,
  useServerError,
} from '@bconnect/ui'
import { formatRegistrationNumber } from '@bconnect/config/brn'
import { formatIsoDateInput } from '@bconnect/config/date'
import { CredentialList } from './CredentialList'
import { oneClickSchema, type OneClickInput, type OneClickOutput } from '../_lib/schema'

interface OneClickTabProps {
  credentials: Credential[]
  onRequestDelete: (id: number) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

const ONE_CLICK_TYPES = [
  'IDENTITY_VERIFICATION',
  'SOLE_PROPRIETOR',
  'CONSTRUCTION_LICENSE',
  'SPECIALTY_CONSTRUCTION_LICENSE',
] as const

export function OneClickTab({
  credentials,
  onRequestDelete,
  isLoading,
  isError,
  onRetry,
}: OneClickTabProps) {
  const form = useForm<OneClickInput, unknown, OneClickOutput>({
    resolver: zodResolver(oneClickSchema),
    mode: 'onTouched',
    defaultValues: { brn: '', ownerName: '', openedAt: '' },
  })

  const server = useServerError(form.control, passthroughError<OneClickInput>())
  const { mutateAsync: validate } = useCreateOneClickValidation()

  const oneClickCredentials = credentials.filter(
    (c) => c.type && (ONE_CLICK_TYPES as readonly string[]).includes(c.type)
  )

  const onSearch = form.handleSubmit(async (data) => {
    server.reset()
    try {
      await validate({ data })
      toast({ description: '자격 증명이 갱신되었어요', variant: 'success' })
    } catch (error) {
      server.capture(error, form.getValues())
    }
  })

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 px-4 py-4">
        <p className="text-r-12 text-gray-500">사업자 및 면허 정보를 한 번에 인증하세요.</p>

        <Form {...form}>
          <form onSubmit={onSearch} className="flex flex-col gap-3">
            <FormError error={server.formError} />
            <TextField
              control={form.control}
              name="brn"
              label="사업자등록번호"
              required
              placeholder="000-00-00000"
              inputMode="numeric"
              transform={formatRegistrationNumber}
            />
            <TextField
              control={form.control}
              name="ownerName"
              label="대표자 성명"
              required
              placeholder="홍길동"
            />
            <TextField
              control={form.control}
              name="openedAt"
              label="개업일자"
              required
              placeholder="0000-00-00"
              inputMode="numeric"
              transform={formatIsoDateInput}
            />

            <FormSubmitButton size="full">조회하기</FormSubmitButton>
          </form>
        </Form>
      </div>

      <CredentialList
        credentials={oneClickCredentials}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        onRequestDelete={onRequestDelete}
        emptyText="아직 등록된 자격 증명이 없어요"
      />
    </div>
  )
}

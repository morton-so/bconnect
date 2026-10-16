'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormSubmitButton, TextField } from '@bconnect/ui'
import { ownerVerifySchema, type OwnerVerifyValues } from '../_lib/schema'
import type { VerifyOwnerResult } from '../_lib/types'

interface OwnerVerifyFormProps {
  registrationNumber: string
}

export function OwnerVerifyForm({ registrationNumber }: OwnerVerifyFormProps) {
  const [result, setResult] = useState<VerifyOwnerResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<OwnerVerifyValues>({
    resolver: zodResolver(ownerVerifySchema),
    mode: 'onTouched',
    defaultValues: { brn: registrationNumber, ownerName: '', openedAt: '' },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/one-click/api/verify-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('조회에 실패했습니다.')

      setResult(await res.json())
    } catch {
      setError('진위확인에 실패했습니다. 다시 시도해주세요.')
    }
  })

  return (
    <div className="mt-4 rounded-lg border border-gray-300 p-4">
      <h4 className="text-sb-14 text-gray-900">사업자 진위확인</h4>
      <p className="mt-1 text-r-12 text-gray-500">
        대표자명, 개업일자가 등록된 정보와 일치하는지 확인해요. (출처: 국세청)
      </p>

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-3 flex items-start gap-2">
          <div className="flex-1">
            <TextField
              control={form.control}
              name="ownerName"
              type="text"
              placeholder="대표자 성명"
              className="h-10"
            />
          </div>
          <div className="flex-1">
            <TextField
              control={form.control}
              name="openedAt"
              type="text"
              placeholder="개업일자 (YYYY-MM-DD)"
              className="h-10"
            />
          </div>
          <FormSubmitButton variant="primary" className="h-10 w-20 shrink-0">
            조회
          </FormSubmitButton>
        </form>
      </Form>

      {result && (
        <p className={`mt-2 text-r-12 ${result.valid ? 'text-[#2E7D32]' : 'text-destructive'}`}>
          {result.message}
        </p>
      )}
      {error && <p className="mt-2 text-r-12 text-destructive">{error}</p>}
    </div>
  )
}

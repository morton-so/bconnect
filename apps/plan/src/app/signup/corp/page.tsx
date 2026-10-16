/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1506-15166
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=3896-3563
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormSubmitButton,
  Form,
  FormError,
  Logo,
  TextField,
  passthroughError,
  toast,
  useServerError,
} from '@bconnect/ui'
import {
  AttachmentContext,
  AttachmentType,
  createAttachmentConfirm,
  createAttachmentPresign,
  getGetMyMemberQueryKey,
  useCreateCompany,
  useGetMyMember,
  useQueryClient,
} from '@bconnect/api-client'
import { formatRegistrationNumber } from '@bconnect/lib/brn'
import { CertificateField } from './_components/CertificateField'
import { corpSchema, type CorpFormData } from './_lib/schema'

// presign → S3 PUT → confirm
async function uploadCertificate(file: File, memberId: number): Promise<number> {
  const [presigned] = await createAttachmentPresign({
    context: AttachmentContext.COMPANY,
    type: AttachmentType.FILE,
    contextId: memberId,
    files: [{ filename: file.name, contentType: file.type, size: file.size }],
  })

  if (!presigned) throw new Error('업로드 URL 누락')

  const res = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  if (!res.ok) throw new Error(`파일 업로드 실패 (${res.status})`)
  await createAttachmentConfirm({ attachmentIds: [presigned.id] })
  return presigned.id
}

export default function SignupCorpPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: me } = useGetMyMember()
  const createCompanyMutation = useCreateCompany()
  const [uploaded, setUploaded] = useState<{ file: File; id: number } | null>(null)

  const form = useForm<CorpFormData>({
    resolver: zodResolver(corpSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      brn: '',
    },
  })
  const { control, handleSubmit } = form

  const server = useServerError(control, passthroughError<CorpFormData>())

  const onSubmit = async (data: CorpFormData) => {
    try {
      if (me == null) throw new Error('회원 정보 로드 전')
      const attachmentId =
        uploaded?.file === data.certificate
          ? uploaded.id
          : await uploadCertificate(data.certificate, me.id)
      setUploaded({ file: data.certificate, id: attachmentId })

      await createCompanyMutation.mutateAsync({
        data: { name: data.name, brn: data.brn, attachmentId },
      })

      await queryClient.invalidateQueries({ queryKey: getGetMyMemberQueryKey() })
      toast({
        description: '업체 등록이 완료되었어요. 심사 결과는 알림으로 알려드릴게요',
        variant: 'success',
      })
      router.replace('/')
    } catch (err) {
      server.capture(err, form.getValues())
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex w-120 flex-col items-center gap-8 rounded-xl border border-gray-300 p-10">
        <Logo width={160} height={56} />
        <p className="text-r-16 text-gray-700">신뢰할 수 있는 인테리어 하도급 섭외 · 관리 서비스</p>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-100 flex-col gap-3">
            <TextField
              control={control}
              name="name"
              type="text"
              label="업체명"
              placeholder="모튼디자인"
            />
            <TextField
              control={control}
              name="brn"
              type="text"
              label="사업자등록번호"
              description="동일한 업장의 중복 가입을 방지해요"
              placeholder="00000-00-000"
              transform={formatRegistrationNumber}
            />
            <CertificateField control={control} />
            <FormError error={server.formError} />
            <FormSubmitButton size="full">업체 등록</FormSubmitButton>
          </form>
        </Form>
      </div>
    </div>
  )
}

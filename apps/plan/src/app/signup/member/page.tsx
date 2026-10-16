/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1506-15140
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1506-15161
 */
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkUsername, requireRegisterAccessToken, useCreateMember } from '@bconnect/api-client'
import { AgreementField, Form, FormSubmitButton, Logo, TextField, toast } from '@bconnect/ui'
import { CONSENT_DEFAULT, CONSENT_ITEMS } from '@bconnect/config/consent'
import { formatIsoDateInput } from '@bconnect/config/date'
import { formatUsername } from '@bconnect/config/username'
import { login } from '@bconnect/features'
import { useSignupStore } from '@/stores/signup-store'
import { memberSchema, type MemberFormData } from './_lib/schema'

export default function SignupMemberPage() {
  const router = useRouter()
  const { formData, reset: resetSignup } = useSignupStore()
  const registerMemberMutation = useCreateMember({
    request: { headers: { 'X-Signup-Token': formData.signupToken } },
  })

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    mode: 'onTouched',
    defaultValues: {
      username: '',
      name: '',
      birth: '',
      agreements: CONSENT_DEFAULT,
    },
  })
  const { control, handleSubmit } = form

  const onSubmit = async (data: MemberFormData) => {
    try {
      const { available } = await checkUsername({ username: data.username })
      if (!available) {
        form.setError('username', { message: '이미 사용 중인 사용자명입니다.' })
        return
      }
      const registered = await registerMemberMutation.mutateAsync({
        data: {
          birth: data.birth,
          username: data.username,
          name: data.name,
          marketingConsent: data.agreements.marketing,
        },
      })
      login(requireRegisterAccessToken(registered))
      resetSignup()
      router.replace('/signup/corp')
    } catch (err) {
      toast({ description: (err as Error).message, variant: 'error' })
      resetSignup()
      router.replace('/login')
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
              name="username"
              type="text"
              autoComplete="username"
              label="사용자 ID"
              description="동일한 사용자를 구분하는데 활용되며, 한 번 설정하면 변경이 불가해요."
              placeholder="user_id"
              transform={formatUsername}
            />
            <TextField
              control={control}
              name="name"
              type="text"
              autoComplete="name"
              label="이름"
              placeholder="홍길동"
            />
            <TextField
              control={control}
              name="birth"
              type="text"
              autoComplete="bday"
              inputMode="numeric"
              label="생년월일"
              placeholder="0000-00-00"
              transform={formatIsoDateInput}
            />
            <AgreementField control={control} name="agreements" items={CONSENT_ITEMS} />
            <FormSubmitButton size="full">가입 완료</FormSubmitButton>
          </form>
        </Form>
      </div>
    </div>
  )
}

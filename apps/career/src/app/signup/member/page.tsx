/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=617-4289
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=617-4273
 */
'use client'

import { useSignupStore } from '@/stores/signup-store'
import { checkUsername, requireRegisterAccessToken, useCreateMember } from '@bconnect/api-client'
import { CONSENT_DEFAULT, CONSENT_ITEMS } from '@bconnect/config/consent'
import { BIRTH_PLACEHOLDER } from '@bconnect/config/signup'
import { formatUsername } from '@bconnect/config/username'
import { login } from '@bconnect/features'
import { AgreementField, Form, FormSubmitButton, TextField, toast } from '@bconnect/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { SignupHeader } from '@/components/SignupHeader'
import { memberSchema, type MemberFormData } from './schema'

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
      name: '',
      username: '',
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
          birth: BIRTH_PLACEHOLDER, // TODO: Date Picker로 교체
          username: data.username,
          name: data.name,
          marketingConsent: data.agreements.marketing,
        },
      })
      login(requireRegisterAccessToken(registered))
      resetSignup()
      router.replace('/signup/profile')
    } catch (err) {
      toast({ description: (err as Error).message, variant: 'error' })
      resetSignup()
      router.replace('/login')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SignupHeader step={2} onBack={() => router.back()} />
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 px-4 pt-3">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl leading-[1.4] font-semibold text-black">
              이름과 서비스에서 사용할 ID를
              <br />
              입력해 주세요
            </h1>
            <TextField
              control={control}
              name="name"
              type="text"
              autoComplete="name"
              label="이름"
              required
              placeholder="이름을 입력해주세요"
            />
            <TextField
              control={control}
              name="username"
              type="text"
              autoComplete="username"
              label="사용자 ID"
              description="ID는 프로필과 검색에 활용되며, 한 번 설정하면 변경이 불가해요."
              placeholder="아이디를 입력해주세요"
              transform={formatUsername}
            />
            <AgreementField control={control} name="agreements" items={CONSENT_ITEMS} />
          </div>
          <FormSubmitButton size="full">다음으로</FormSubmitButton>
        </form>
      </Form>
    </div>
  )
}

/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1416-1534
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1506-15119
 */
'use client'

import { login } from '@bconnect/features'
import { useSignupStore } from '@/stores/signup-store'
import { useSendOtp, useVerifyOtp } from '@bconnect/api-client'
import { formatPhoneNumber } from '@bconnect/lib/phone'
import { Regex } from '@bconnect/lib/regex'
import {
  Form,
  FormSubmitButton,
  Logo,
  TextField,
  passthroughError,
  useServerError,
} from '@bconnect/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { OtpTimer } from './_components/OtpTimer'
import { loginSchema, type LoginFormData } from './_lib/schema'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const { setSignupToken } = useSignupStore()

  const [step, setStep] = useState<Step>('phone')
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', code: '' },
    mode: 'onTouched',
  })

  const phoneServer = useServerError(form.control, passthroughError<LoginFormData>('phone'))
  const codeServer = useServerError(form.control, passthroughError<LoginFormData>('code'))

  const sendCodeMutation = useSendOtp()
  const verifyCodeMutation = useVerifyOtp()

  useEffect(() => {
    if (step === 'otp') form.setFocus('code')
  }, [step, form])

  const phoneValue = useWatch({ control: form.control, name: 'phone' })
  const codeValue = useWatch({ control: form.control, name: 'code' })
  const isPhoneValid = loginSchema.shape.phone.safeParse(phoneValue).success
  const isCodeValid = (codeValue ?? '').length === 6

  const sendCode = async () => {
    const phone = form.getValues('phone')
    try {
      const result = await sendCodeMutation.mutateAsync({
        data: { phone },
      })
      if (result.expiresAt) {
        setExpiresAt(result.expiresAt)
      }
      setStep('otp')
    } catch (err) {
      phoneServer.capture(err, form.getValues())
    }
  }

  const lastFailedAttempt = useRef<{ code: string; error: unknown } | null>(null)

  const verifyCode = async ({ silent = false }: { silent?: boolean } = {}) => {
    const { phone, code } = form.getValues()
    if (lastFailedAttempt.current?.code === code) {
      if (!silent) codeServer.capture(lastFailedAttempt.current.error, form.getValues())
      return
    }
    try {
      const result = await verifyCodeMutation.mutateAsync({
        data: { phone, code },
      })
      lastFailedAttempt.current = null
      if (result.registered) {
        login(result.accessToken)
        const redirect = new URLSearchParams(window.location.search).get('redirect')
        window.location.assign(
          redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
        )
      } else {
        setSignupToken(result.signupToken)
        router.push('/signup/member')
      }
    } catch (err) {
      lastFailedAttempt.current = { code, error: err }
      if (!silent) codeServer.capture(err, form.getValues())
    }
  }

  const lastAutoVerifiedCode = useRef<string | null>(null)

  useEffect(() => {
    if (step !== 'otp' || !isCodeValid || verifyCodeMutation.isPending) return
    if (lastAutoVerifiedCode.current === codeValue) return
    lastAutoVerifiedCode.current = codeValue
    verifyCode({ silent: true })
  }, [step, isCodeValid, codeValue, verifyCodeMutation.isPending, verifyCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'phone') {
      if (await form.trigger('phone')) await sendCode()
    } else {
      if (await form.trigger()) await verifyCode()
    }
  }

  const handleResend = async () => {
    form.setValue('code', '')
    codeServer.reset()
    await sendCode()
  }

  const isSubmitDisabled = step === 'phone' ? !isPhoneValid : !isCodeValid
  const isSubmitLoading =
    step === 'phone' ? sendCodeMutation.isPending : verifyCodeMutation.isPending

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex w-120 flex-col items-center gap-8 rounded-xl border border-gray-300 p-10">
        <Logo width={160} height={56} />

        <p className="text-r-16 text-gray-700">신뢰할 수 있는 인테리어 하도급 섭외 · 관리 서비스</p>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex w-100 flex-col gap-3">
            <TextField
              control={form.control}
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              enterKeyHint="next"
              label="휴대전화"
              description="품앗이 서비스는 인증된 사용자만 이용하실 수 있어요."
              placeholder="010-0000-0000"
              disabled={step === 'otp'}
              transform={(raw) => raw.replace(Regex.NON_DIGIT, '').slice(0, 11)}
              format={formatPhoneNumber}
              serverError={phoneServer.fieldError('phone')}
            />

            {step === 'otp' && (
              <TextField
                control={form.control}
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                enterKeyHint="done"
                placeholder="숫자 6자리"
                hint="타인에게 인증번호를 공유하지 마세요."
                transform={(raw) => raw.replace(Regex.NON_DIGIT, '').slice(0, 6)}
                serverError={codeServer.fieldError('code')}
                rightElement={
                  <OtpTimer
                    expiresAt={expiresAt}
                    onResend={handleResend}
                    isResending={sendCodeMutation.isPending}
                  />
                }
              />
            )}

            <FormSubmitButton
              requireValid={false}
              size="full"
              disabled={isSubmitDisabled}
              isLoading={isSubmitLoading}
            >
              {step === 'phone' ? '인증번호 받기' : '인증 완료'}
            </FormSubmitButton>
          </form>
        </Form>
      </div>
    </div>
  )
}

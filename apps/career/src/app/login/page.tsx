/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=617-4394
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=617-4405
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=617-4420
 */
'use client'

import { login } from '@bconnect/features'
import { useSignupStore } from '@/stores/signup-store'
import { useSendOtp, useVerifyOtp } from '@bconnect/api-client'
import { formatPhoneNumber, isValidPhoneNumber, toNationalNumber } from '@bconnect/config/phone'
import { Form, FormSubmitButton, TextField, passthroughError, useServerError } from '@bconnect/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { SignupHeader } from '@/components/SignupHeader'
import { OtpTimer } from './_components/OtpTimer'
import { loginSchema, type LoginFormData } from './schema'

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
  const isPhoneValid = isValidPhoneNumber(phoneValue ?? '')
  const isCodeValid = (codeValue ?? '').length === 6

  const sendCode = async () => {
    const phone = form.getValues('phone')
    try {
      const result = await sendCodeMutation.mutateAsync({
        data: { phone: toNationalNumber(phone) },
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
        data: { phone: toNationalNumber(phone), code },
      })
      lastFailedAttempt.current = null
      if (result.registered) {
        // 가입한 회원
        login(result.accessToken)
        const redirect = new URLSearchParams(window.location.search).get('redirect')
        window.location.assign(
          redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
        )
      } else {
        // 신규 회원
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SignupHeader step={1} onBack={() => (step === 'otp' ? setStep('phone') : router.back())} />

      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-4 pt-3">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl leading-[1.4] font-semibold text-[#1B1B1B]">
              신뢰할 수 있는 계약을 위해
              <br />
              <span className="text-primary">본인 확인</span>이 필요해요
            </h1>

            <TextField
              control={form.control}
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              enterKeyHint="next"
              placeholder="010-1234-5678"
              description="품앗이 서비스는 인증된 기술자만 이용하실 수 있어요."
              disabled={step === 'otp'}
              transform={formatPhoneNumber}
              serverError={phoneServer.fieldError('phone')}
            />
          </div>

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
              transform={(raw) => raw.replace(/\D/g, '').slice(0, 6)}
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

          {step === 'phone' ? (
            <FormSubmitButton
              requireValid={false}
              variant="outline"
              size="full"
              disabled={!isPhoneValid}
              isLoading={sendCodeMutation.isPending}
            >
              다음
            </FormSubmitButton>
          ) : (
            <FormSubmitButton
              requireValid={false}
              size="full"
              disabled={!isCodeValid}
              isLoading={verifyCodeMutation.isPending}
            >
              다음으로
            </FormSubmitButton>
          )}
        </form>
      </Form>
    </div>
  )
}

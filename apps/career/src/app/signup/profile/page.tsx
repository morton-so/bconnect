/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=643-8028
 */
'use client'

import { AddressField } from '@/components/AddressField'
import { SIGNUP_ROLES } from '@/lib/role-labels'
import {
  ROLE_LABELS,
  Trade,
  TRADE_LABELS,
  refreshAccessToken,
  useCreateProfile,
} from '@bconnect/api-client'
import { isCompleteAddress } from '@bconnect/config/address'
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmitButton,
  NumberField,
  passthroughError,
  SelectField,
  Tag,
  TextField,
  useScrollToError,
  useServerError,
} from '@bconnect/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { SignupHeader } from '@/components/SignupHeader'
import { TradeSelector } from './_components/TradeSelector'
import { MAX_TRADES, profileSchema, type ProfileFormData } from './schema'

export default function SignupProfilePage() {
  const router = useRouter()
  const createProfileMutation = useCreateProfile()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: {
      fields: [],
      primaryField: undefined,
      experience: undefined,
      role: undefined,
      address: undefined,
      headline: '',
    },
  })
  const { control, handleSubmit, setValue } = form

  const server = useServerError(control, passthroughError<ProfileFormData>())

  const watchedFields = useWatch({ control, name: 'fields' })
  const watchedPrimaryField = useWatch({ control, name: 'primaryField' })

  const selectedFields = watchedFields || []

  // 공종 선택 시 대표분야 자동 설정
  useEffect(() => {
    if (
      watchedFields &&
      watchedFields.length > 0 &&
      !watchedFields.includes(watchedPrimaryField as string)
    ) {
      setValue('primaryField', watchedFields[0])
    }
  }, [watchedFields, watchedPrimaryField, setValue])

  const scrollToError = useScrollToError()

  const onSubmit = async (data: ProfileFormData) => {
    if (!isCompleteAddress(data.address)) return
    try {
      await createProfileMutation.mutateAsync({
        data: {
          role: data.role,
          primaryTrade: data.primaryField as Trade,
          trades: data.fields as Trade[],
          experience: data.experience,
          headline: data.headline || undefined,
          address: data.address,
        },
      })
      await refreshAccessToken()
      window.location.assign('/signup/complete')
    } catch (err) {
      server.capture(err, data)
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      <SignupHeader step={3} onBack={() => router.back()} />
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit, scrollToError)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-3 pb-6">
            <h1 className="text-sb-24 text-black">
              기술자님의 공종과
              <br />
              역할을 선택해주세요
            </h1>
            <TradeSelector control={control} name="fields" max={MAX_TRADES} />
            <SelectField
              control={control}
              name="primaryField"
              label="대표분야"
              required
              fitContent
              disabled={selectedFields.length === 0}
              placeholder="선택해주세요"
              options={selectedFields.map((trade) => ({
                value: trade,
                label: TRADE_LABELS[trade as Trade],
              }))}
            />
            <NumberField
              control={control}
              name="experience"
              label="경력"
              required
              maxLength={2}
              placeholder="경력을 입력해주세요 (년)"
            />
            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <FormLabel required>유형</FormLabel>
                  <FormControl>
                    <div tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
                      {SIGNUP_ROLES.map((role) => (
                        <Tag
                          key={role}
                          variant={field.value === role ? 'selected' : 'default'}
                          onClick={() => field.onChange(role)}
                        >
                          {ROLE_LABELS[role]}
                        </Tag>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AddressField
              control={control}
              name="address"
              label="주소"
              required
              description="정확한 매칭을 위해 일하는 곳을 기준으로 입력해주세요"
            />
            <TextField
              control={control}
              name="headline"
              type="text"
              label="한줄소개"
              maxLength={20}
              placeholder="한줄소개를 입력해주세요 (최대 20글자)"
            />
            <FormError error={server.formError} />
          </div>
          <div className="bg-white px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <FormSubmitButton size="full">완료</FormSubmitButton>
          </div>
        </form>
      </Form>
    </div>
  )
}

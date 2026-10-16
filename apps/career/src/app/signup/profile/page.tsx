/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=643-8028
 */
'use client'

import { AddressField } from '@/components/AddressField'
import { SIGNUP_ROLES } from './_lib/role-labels'
import {
  ROLE_LABELS,
  TRADE_LABELS,
  refreshAccessToken,
  useCreateProfile,
} from '@bconnect/api-client'
import { isCompleteAddress } from '@bconnect/lib/address'
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
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { SignupHeader } from '@/components/SignupHeader'
import { TradeSelector } from './_components/TradeSelector'
import { MAX_TRADES, profileSchema, type ProfileFormData } from './_lib/schema'

export default function SignupProfilePage() {
  const createProfileMutation = useCreateProfile()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: {
      trades: [],
      primaryTrade: undefined,
      experience: undefined,
      role: undefined,
      address: undefined,
      headline: '',
    },
  })
  const { control, handleSubmit, setValue } = form

  const server = useServerError(control, passthroughError<ProfileFormData>())

  const watchedTrades = useWatch({ control, name: 'trades' })
  const watchedPrimaryTrade = useWatch({ control, name: 'primaryTrade' })

  const selectedTrades = watchedTrades || []

  useEffect(() => {
    if (watchedTrades && watchedTrades.length > 0 && !watchedTrades.includes(watchedPrimaryTrade)) {
      setValue('primaryTrade', watchedTrades[0])
    }
  }, [watchedTrades, watchedPrimaryTrade, setValue])

  const scrollToError = useScrollToError()

  const onSubmit = async (data: ProfileFormData) => {
    if (!isCompleteAddress(data.address)) return
    try {
      await createProfileMutation.mutateAsync({
        data: {
          role: data.role,
          primaryTrade: data.primaryTrade,
          trades: data.trades,
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
      <SignupHeader step={3} backHref="/signup/member" />
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
            <TradeSelector control={control} name="trades" max={MAX_TRADES} />
            <SelectField
              control={control}
              name="primaryTrade"
              label="대표분야"
              required
              fitContent
              disabled={selectedTrades.length === 0}
              placeholder="선택해주세요"
              options={selectedTrades.map((trade) => ({
                value: trade,
                label: TRADE_LABELS[trade],
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
              maxLength={50}
              placeholder="한줄소개를 입력해주세요 (최대 50글자)"
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

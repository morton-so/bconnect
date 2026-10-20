'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useGetMyProfile,
  useUpdateMyProfile,
  useUpdateMyProfileAbout,
  Trade,
  type ProfileRole,
} from '@bconnect/api-client'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  NumberField,
  SelectField,
  Tag,
  TextareaField,
  TextField,
  TopBar,
  useScrollToError,
} from '@bconnect/ui'
import { TRADE_LABELS, TRADE_GROUPS } from '@bconnect/api-client'
import { AddressField } from '@/components/AddressField'
import { isCompleteAddress } from '@bconnect/lib/address'
import { MAX_TRADES, profileEditSchema, type ProfileEditFormData } from './_lib/schema'

/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1235-4100
 */
export default function ProfileEditPage() {
  const router = useRouter()

  const { data: profile, isLoading: isProfileLoading } = useGetMyProfile()

  const updateProfileMutation = useUpdateMyProfile()
  const updateAboutMutation = useUpdateMyProfileAbout()

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    mode: 'onTouched',
    defaultValues: {
      primaryTrade: undefined,
      trades: [],
      experience: undefined,
      headline: '',
      about: '',
      address: undefined,
    },
  })
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form

  useEffect(() => {
    if (profile) {
      // TODO: BE required 처리 후 type narrowing 필요. profile 필수 표시값이 optional emit이라 폼 초기값에서 임시 fallback 중.
      reset({
        primaryTrade: profile.primaryTrade ?? undefined,
        trades: profile.trades ?? [],
        experience: profile.experience ?? undefined,
        headline: profile.headline ?? '',
        about: profile.about ?? '',
        address: profile.address ?? undefined,
      })
    }
  }, [profile, reset])

  const watchedTrades = useWatch({ control, name: 'trades' })
  const watchedPrimaryTrade = useWatch({ control, name: 'primaryTrade' })

  const isLoading = isProfileLoading
  const isSaving = isSubmitting || updateProfileMutation.isPending || updateAboutMutation.isPending

  const scrollToError = useScrollToError()

  const onSubmit = async (data: ProfileEditFormData) => {
    if (!isCompleteAddress(data.address)) return
    try {
      const promises: Promise<unknown>[] = []

      promises.push(
        updateProfileMutation.mutateAsync({
          data: {
            // TODO: BE required 처리 후 type narrowing 필요. Profile.role 필수값이 optional emit이라 임시 cast로 유지.
            role: profile?.role as ProfileRole,
            primaryTrade: data.primaryTrade,
            trades: data.trades,
            experience: data.experience,
            headline: data.headline || undefined,
            address: data.address,
          },
        })
      )

      // About 별도 업데이트
      if (data.about != null) {
        promises.push(
          updateAboutMutation.mutateAsync({
            data: { about: data.about || undefined },
          })
        )
      }

      await Promise.all(promises)
      router.replace('/profile')
    } catch (err) {
      console.error('프로필 수정 실패:', err)
    }
  }

  const toggleTrade = (tradeValue: Trade) => {
    const currentTrades = watchedTrades ?? []
    if (currentTrades.includes(tradeValue)) {
      const updated = currentTrades.filter((t) => t !== tradeValue)
      setValue('trades', updated, { shouldValidate: true })
      if (watchedPrimaryTrade === tradeValue) {
        setValue('primaryTrade', updated[0] as Trade, { shouldValidate: true })
      }
    } else if (currentTrades.length < MAX_TRADES) {
      const updated = [...currentTrades, tradeValue]
      setValue('trades', updated, { shouldValidate: true })
      if (!watchedPrimaryTrade) {
        setValue('primaryTrade', tradeValue, { shouldValidate: true })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <TopBar variant="default" title="프로필 수정" backHref="/profile" />
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-m-14 text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopBar
        variant="default"
        title="프로필 수정"
        actionText={isSaving ? '저장 중...' : '완료'}
        onAction={handleSubmit(onSubmit, scrollToError)}
        backHref="/profile"
      />

      <Form {...form}>
        <form className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pt-3 pb-24">
          <FormField
            control={control}
            name="trades"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel required className="text-m-16 text-gray-900">
                  공종
                </FormLabel>
                <FormDescription>
                  최대 {MAX_TRADES}개까지 선택 가능해요 ({(watchedTrades ?? []).length}/{MAX_TRADES}
                  )
                </FormDescription>
                <FormControl>
                  <div tabIndex={-1} className="flex flex-col gap-3 outline-none">
                    {TRADE_GROUPS.map((group) => (
                      <div key={group.label} className="flex flex-col gap-3">
                        <p className="text-m-14 text-gray-700">{group.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.trades.map((tradeValue) => {
                            const isSelected = field.value?.includes(tradeValue) ?? false
                            return (
                              <Tag
                                key={tradeValue}
                                variant={isSelected ? 'selected' : 'default'}
                                onClick={() => toggleTrade(tradeValue)}
                              >
                                {TRADE_LABELS[tradeValue]}
                              </Tag>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectField
            control={control}
            name="primaryTrade"
            label="대표분야"
            required
            fitContent
            disabled={(watchedTrades ?? []).length === 0}
            placeholder="선택해주세요"
            options={(watchedTrades ?? []).map((trade) => ({
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

          <TextField
            control={control}
            name="headline"
            label="한줄소개"
            placeholder="한줄소개를 입력해주세요 (최대 50글자)"
          />

          <TextareaField
            control={control}
            name="about"
            label="소개"
            rows={4}
            placeholder="자기소개를 입력해주세요"
          />

          <AddressField
            control={control}
            name="address"
            label="주소"
            description="정확한 매칭을 위해 일하는 곳을 기준으로 입력해주세요"
          />
        </form>
      </Form>
    </div>
  )
}

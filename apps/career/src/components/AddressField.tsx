/**
 * @figma-todo 주소 입력 필드 디자인 미정
 */
'use client'

import { emptyAddressDraft, mapKakaoAddress } from '@bconnect/lib/address'
import type { AddressDraft } from '@bconnect/lib/address'
import { UnknownSidoError, UNKNOWN_SIDO_MESSAGE } from '@bconnect/lib/errors'
import {
  AddressSearchDrawer,
  cn,
  fieldItem,
  fieldLabel,
  fieldSlot,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  ROW_INPUT_CLASSES,
  type AddressSearchResult,
  type FieldLayout,
} from '@bconnect/ui'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

interface AddressFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  description?: string
  /** 라벨에 필수 표시(*). 상세주소는 BE 제약이 없어 대상 아님 — 도로명 주소만 필수. */
  required?: boolean
  layout?: FieldLayout
}

export function AddressField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  layout = 'stacked',
}: AddressFieldProps<T>) {
  const [open, setOpen] = useState(false)
  const { setError, clearErrors } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as AddressDraft | null
        const setDetail = (detail: string) =>
          field.onChange({ ...(value ?? emptyAddressDraft()), detail })
        const handleComplete = (result: AddressSearchResult) => {
          try {
            const mapped = mapKakaoAddress(result)
            clearErrors(name)
            field.onChange({ ...mapped, detail: value?.detail })
          } catch (e) {
            if (!(e instanceof UnknownSidoError)) throw e
            setError(name, { type: 'unknown-sido', message: UNKNOWN_SIDO_MESSAGE })
          }
        }

        if (layout === 'row') {
          return (
            <>
              <FormItem className={cn('grid', fieldItem({ layout }))}>
                <FormLabel className={fieldLabel({ layout })} required={required}>
                  {label ?? '현장주소'}
                </FormLabel>
                <FormControl className={fieldSlot({ layout })}>
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={cn(
                      ROW_INPUT_CLASSES,
                      'flex w-full cursor-pointer items-center text-left'
                    )}
                  >
                    {value?.street ?? <span className="text-[#777777]">주소를 검색해주세요</span>}
                  </button>
                </FormControl>
                <FormMessage className={fieldSlot({ layout })} />
              </FormItem>

              <div className={cn('grid', fieldItem({ layout }))}>
                <span className={fieldLabel({ layout })}>상세주소</span>
                <Input
                  value={value?.detail ?? ''}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="상세주소를 입력해주세요"
                  className={cn(ROW_INPUT_CLASSES, fieldSlot({ layout }))}
                />
              </div>

              <AddressSearchDrawer open={open} onOpenChange={setOpen} onComplete={handleComplete} />
            </>
          )
        }

        return (
          <FormItem className="gap-3">
            {label && (
              <FormLabel className="text-m-16 text-gray-900" required={required}>
                {label}
              </FormLabel>
            )}
            {description && (
              <FormDescription className="text-r-14 text-gray-500">{description}</FormDescription>
            )}

            <FormControl>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-12 w-full cursor-pointer items-center rounded-lg border border-gray-300 px-3 text-left text-sm text-gray-700 transition-colors outline-none focus:border-primary focus:ring-1 focus:ring-primary aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/50"
              >
                {value?.street ?? <span className="text-gray-400">주소를 검색해주세요</span>}
              </button>
            </FormControl>

            {value && (
              <Input
                value={value.detail ?? ''}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="상세주소를 입력해주세요 (동/호 등)"
              />
            )}

            <FormMessage />

            <AddressSearchDrawer open={open} onOpenChange={setOpen} onComplete={handleComplete} />
          </FormItem>
        )
      }}
    />
  )
}

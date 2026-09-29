'use client'

import { useRef, useState } from 'react'
import type { Control } from 'react-hook-form'
import {
  DownloadIcon,
  FolderAddIcon,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  cn,
} from '@bconnect/ui'
import { CERTIFICATE_ACCEPT, CERTIFICATE_MAX_BYTES, type CorpFormData } from '../schema'

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)}KB` : `${(bytes / 1024 / 1024).toFixed(1)}MB`

// 제출 전 로컬 파일이라 object URL 로 내려받는다.
function download(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

/** 사업자등록증 단일 첨부. 빈 상태는 dropzone, 첨부 상태는 파일 카드. 업로드는 제출 시 page 가 한다. */
export function CertificateField({ control }: { control: Control<CorpFormData> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [pickError, setPickError] = useState<string>()

  return (
    <FormField
      control={control}
      name="certificate"
      render={({ field }) => {
        const file = field.value

        const pick = (picked?: File) => {
          if (!picked) return
          // 드롭한 파일은 input accept 를 거치지 않아 여기서 다시 거른다.
          // TODO: 에러 문구 디자인 확정 시 교체
          if (!CERTIFICATE_ACCEPT.includes(picked.type)) {
            setPickError('PDF, JPG, PNG 파일만 첨부할 수 있어요.')
            return
          }
          if (picked.size > CERTIFICATE_MAX_BYTES) {
            setPickError('20MB 이하 파일만 첨부할 수 있어요.')
            return
          }
          setPickError(undefined)
          field.onChange(picked)
        }

        return (
          <FormItem className="gap-3">
            <FormLabel className="text-m-16 text-gray-900">사업자등록증</FormLabel>
            <FormDescription className="text-r-14 text-gray-500">
              사업자등록증을 첨부해주세요.
            </FormDescription>

            <input
              ref={inputRef}
              type="file"
              accept={CERTIFICATE_ACCEPT.join(',')}
              onChange={(e) => {
                pick(e.target.files?.[0])
                e.target.value = ''
              }}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                pick(e.dataTransfer.files[0])
              }}
              className={cn(
                dragging && 'rounded-lg outline outline-2 outline-primary outline-dashed'
              )}
            >
              {file ? (
                // TODO: 첨부 후 삭제·교체 동작 확정 전. 교체는 드롭만 지원
                <div className="flex items-center justify-between gap-3 rounded-[10px] border border-gray-200 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center text-gray-400">
                      <FolderAddIcon size={20} />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-m-14 text-gray-900">{file.name}</span>
                      <span className="text-r-12 text-gray-500">{formatSize(file.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => download(file)}
                    aria-label={`${file.name} 다운로드`}
                    className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-gray-400 outline-none hover:text-gray-600 focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <DownloadIcon size={20} />
                  </button>
                </div>
              ) : (
                <FormControl>
                  <button
                    ref={field.ref}
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onBlur={field.onBlur}
                    className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-sm border border-gray-200 p-4 outline-none focus-visible:ring-1 focus-visible:ring-primary aria-invalid:border-destructive"
                  >
                    <span className="flex size-6 items-center justify-center text-gray-400">
                      <FolderAddIcon size={20} />
                    </span>
                    <span className="text-sb-14 text-gray-900">파일을 여기에 끌어오거나 선택</span>
                    <span className="text-m-14 text-gray-400">지원 : PDF, JPG, PNG</span>
                  </button>
                </FormControl>
              )}
            </div>

            <FormMessage>{pickError}</FormMessage>
          </FormItem>
        )
      }}
    />
  )
}

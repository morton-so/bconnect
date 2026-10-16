'use client'

import Image from 'next/image'
import { EditIcon } from '@bconnect/ui'

interface ProfileImageProps {
  src: string
  alt: string
  onEdit?: () => void
  uploading?: boolean
}

export function ProfileImage({ src, alt, onEdit, uploading }: ProfileImageProps) {
  return (
    <div className="relative size-[100px] shrink-0">
      <div className="relative size-full overflow-hidden rounded-full bg-gray-100">
        {/* TODO: 출시 전 unoptimized 제거 + next/image remotePatterns/loader 구성 (외부 업로드 대응) */}
        <Image src={src} alt={alt} fill sizes="100px" unoptimized className="object-cover" />
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={uploading}
          aria-label="프로필 이미지 수정"
          className="absolute right-0 bottom-0 flex size-6 cursor-pointer items-center justify-center rounded-full bg-gray-900 text-white transition-all outline-none hover:opacity-80 focus-visible:ring-1 focus-visible:ring-primary active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <EditIcon size={13} />
        </button>
      )}
    </div>
  )
}

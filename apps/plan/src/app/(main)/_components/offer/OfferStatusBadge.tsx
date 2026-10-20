import { OfferStatus } from '@bconnect/api-client'
import { cn } from '@bconnect/ui'

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const isActive = status === OfferStatus.ACTIVE
  return (
    <span
      className={cn(
        'inline-flex h-[22px] shrink-0 items-center justify-center rounded-[4px] border px-2 text-[11px] leading-[16.5px] whitespace-nowrap',
        isActive
          ? 'border-primary bg-secondary font-semibold text-primary'
          : 'border-[#e5e5e5] bg-white font-normal text-[#a5a5a5]'
      )}
    >
      {isActive ? '섭외중' : '대기중'}
    </span>
  )
}

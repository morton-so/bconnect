import Link from 'next/link'
import { ChevronIcon } from '@bconnect/ui'

interface SettingsRowProps {
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
}

const rowClassName =
  'flex h-10 w-full items-center justify-between border-b border-gray-300 transition-opacity active:opacity-60'

export function SettingsRow({ label, href, onClick, disabled }: SettingsRowProps) {
  const content = (
    <>
      <span className="text-r-14 text-gray-900">{label}</span>
      <ChevronIcon direction="right" size={16} className="text-gray-400" />
    </>
  )

  if (href) {
    return (
      <Link href={href} className={`${rowClassName} cursor-pointer`}>
        {content}
      </Link>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${rowClassName} cursor-pointer disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {content}
    </button>
  )
}

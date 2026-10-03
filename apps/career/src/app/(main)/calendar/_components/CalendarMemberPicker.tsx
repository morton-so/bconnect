'use client'

import { useGetCoworkers, useGetMyMember } from '@bconnect/api-client'
import { Select } from '@bconnect/ui'

const MINE = 'mine'

interface CalendarMemberPickerProps {
  member: number | null
  onChange: (member: number | null) => void
}

export function CalendarMemberPicker({ member, onChange }: CalendarMemberPickerProps) {
  const { data: me } = useGetMyMember()
  const myId = me?.id
  const { data: coworkers } = useGetCoworkers(
    { memberId: myId! },
    { query: { enabled: myId != null } }
  )

  const options = [
    { value: MINE, label: '내 일정' },
    ...(coworkers ?? []).map((c) => ({ value: String(c.member.id), label: c.member.name })),
  ]

  return (
    <Select
      fitContent
      placeholder="동료 일정"
      value={member == null ? MINE : String(member)}
      onChange={(v) => onChange(typeof v === 'string' && v !== MINE ? Number(v) : null)}
      options={options}
    />
  )
}

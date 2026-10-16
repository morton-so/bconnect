'use client'

import type { ReactNode } from 'react'
import { getRoleLabel, getTradeLabel } from '@bconnect/api-client'
import type { Coworker } from '@bconnect/api-client'
import { ProfileCard, ProfileCardSkeleton } from '@bconnect/ui'
import { DEFAULT_PROFILE_IMAGE } from '@bconnect/lib/avatar'
import { PanelMessage } from '../PanelMessage'

export interface CoworkerListProps {
  coworkers?: Coworker[]
  isLoading: boolean
  isError: boolean
  coworkerHref: (profileId: number) => string
  /**
   * 행 우측 ⋮ 메뉴(동료 관리) 렌더 슬롯. 주면 행이 profileHref(아바타+이름만 링크)+rightSlot 으로
   * 전환되어 카드 본문 탭이 프로필로 넘어가지 않는다. 미주입 시 카드 전체가 프로필 링크(기존 동작).
   */
  renderRowMenu?: (coworker: Coworker) => ReactNode
}

export function CoworkerList({
  coworkers,
  isLoading,
  isError,
  coworkerHref,
  renderRowMenu,
}: CoworkerListProps) {
  if (isLoading) return <CoworkerSkeletonList />
  if (isError) return <PanelMessage>동료를 불러올 수 없습니다</PanelMessage>
  if (!coworkers || coworkers.length === 0)
    return <PanelMessage>등록된 동료가 없습니다</PanelMessage>

  return (
    <ul className="flex flex-col">
      {coworkers.map((coworker) => {
        // TODO: BE required 처리 후 type narrowing 필요. Coworker.member.id는 행 링크 필수값인데 optional emit이라 없는 행은 임시로 렌더 제외.
        const memberId = coworker.member?.id
        if (memberId == null) return null
        return (
          <CoworkerRow
            key={coworker.id}
            coworker={coworker}
            href={coworkerHref(memberId)}
            menu={renderRowMenu?.(coworker)}
          />
        )
      })}
    </ul>
  )
}

function CoworkerRow({
  coworker,
  href,
  menu,
}: {
  coworker: Coworker
  href: string
  menu?: ReactNode
}) {
  const { member, profile } = coworker
  const name = member?.name ?? '이름 없음'

  return (
    <ProfileCard
      as="li"
      className="px-4"
      avatarUrl={member?.picture || DEFAULT_PROFILE_IMAGE}
      name={name}
      meta={{
        // TODO: BE required 처리 후 type narrowing 필요. region/trade는 표시 필수값인데 optional emit이라 빈값으로 silent fallback 중.
        region: profile?.address?.city ?? '',
        trade: profile?.primaryTrade ? getTradeLabel(profile.primaryTrade) : '',
        role: profile?.role ? getRoleLabel(profile.role) : undefined,
      }}
      description={profile?.headline ?? undefined}
      // ⋮ 메뉴가 있으면 아바타+이름만 링크(profileHref)로 두어 rightSlot 케밥과 탭 충돌 방지.
      // 없으면 카드 전체가 프로필 링크(href) — 기존 동작.
      {...(menu
        ? { profileHref: href, rightSlot: menu, rightSlotAlign: 'center' as const }
        : { href })}
    />
  )
}

function CoworkerSkeletonList() {
  return (
    <ul className="flex flex-col">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProfileCardSkeleton key={i} as="li" className="px-4" />
      ))}
    </ul>
  )
}

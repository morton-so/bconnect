'use client'

import { useState, type ReactNode } from 'react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { getRoleLabel, getTradeLabel } from '@bconnect/api-client'
import type { Recommendation } from '@bconnect/api-client'
import {
  ActionDrawer,
  cn,
  EditIcon,
  HideIcon,
  MoreVerticalIcon,
  ProfileCard,
  ProfileCardSkeleton,
  Tab,
  TrashIcon,
} from '@bconnect/ui'
import { DEFAULT_PROFILE_IMAGE } from '@bconnect/lib/avatar'

type Mode = 'received' | 'sent'

interface RecommendationListProps {
  received?: Recommendation[]
  sent?: Recommendation[]
  variant?: 'full' | 'inline'
  onHide?: (id: number) => void
  onShow?: (id: number) => void
  onDelete?: (id: number) => void
  onEdit?: (id: number) => void
}

export function RecommendationList({
  received,
  sent,
  variant = 'full',
  onHide,
  onShow,
  onDelete,
  onEdit,
}: RecommendationListProps) {
  const [mode, setMode] = useQueryState(
    'rtab',
    parseAsStringLiteral(['received', 'sent'] as const)
      .withDefault('received')
      // 탭 전환은 히스토리를 쌓지 않음(replace) → TopBar 뒤로가기가 탭을 되돌리지 않고 화면을 정상 이탈
      .withOptions({ history: 'replace' })
  )
  const [openId, setOpenId] = useState<number | null>(null)

  const active = mode === 'received' ? received : sent
  const isLoading = active === undefined
  const items = active ?? []
  const canAct = variant === 'full' && (mode === 'received' ? !!onHide : !!onDelete)
  const openRec = items.find((rec) => rec.id === openId)
  const rowPx = variant === 'full' ? 'px-4' : ''

  return (
    <section className={cn('flex flex-col', variant === 'inline' && 'gap-3')}>
      {variant === 'full' ? (
        <Tab
          items={[
            { key: 'received', label: `받은 추천서${received ? `(${received.length})` : ''}` },
            { key: 'sent', label: `보낸 추천서${sent ? `(${sent.length})` : ''}` },
          ]}
          activeKey={mode}
          onChange={(key) => setMode(key as Mode)}
        />
      ) : (
        <div className="flex gap-2">
          <ToggleButton active={mode === 'received'} onClick={() => setMode('received')}>
            받은 추천서
          </ToggleButton>
          <ToggleButton active={mode === 'sent'} onClick={() => setMode('sent')}>
            보낸 추천서
          </ToggleButton>
        </div>
      )}

      {isLoading ? (
        <ul className="flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProfileCardSkeleton key={i} as="li" className={rowPx} />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className={cn('py-3 text-r-14 text-gray-500', rowPx)}>
          {mode === 'received' ? '받은 추천서가 없습니다' : '보낸 추천서가 없습니다'}
        </p>
      ) : (
        <ul className="flex flex-col">
          {items.map((rec) => {
            // TODO: BE required 처리 후 type narrowing 필요. Recommendation.id는 케밥 액션 키인데 optional emit이라 없으면 액션이 조용히 닫힘.
            return (
              <RecommendationItem
                key={rec.id}
                recommendation={rec}
                showMenu={canAct}
                onMenuClick={() => setOpenId(rec.id ?? null)}
                rowClassName={rowPx}
              />
            )
          })}
        </ul>
      )}

      <ActionDrawer
        open={openId !== null}
        onOpenChange={(open) => {
          if (!open) setOpenId(null)
        }}
        items={
          openRec == null
            ? []
            : mode === 'received'
              ? [
                  openRec.visible === false
                    ? {
                        label: '숨김 해제',
                        icon: <HideIcon size={18} />,
                        onSelect: () => openRec.id != null && onShow?.(openRec.id),
                      }
                    : {
                        label: '숨김',
                        icon: <HideIcon size={18} />,
                        onSelect: () => openRec.id != null && onHide?.(openRec.id),
                      },
                ]
              : [
                  {
                    label: '수정',
                    icon: <EditIcon size={18} />,
                    disabled: !onEdit,
                    onSelect: () => openRec.id != null && onEdit?.(openRec.id),
                  },
                  {
                    label: '삭제',
                    icon: <TrashIcon size={18} />,
                    destructive: true,
                    onSelect: () => openRec.id != null && onDelete?.(openRec.id),
                  },
                ]
        }
      />
    </section>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'cursor-pointer rounded-md border border-[#E5E5E5] px-3 py-2 text-[14px] leading-[21px] text-[#1B1B1B]',
        active ? 'bg-[#F5F5F5] font-semibold' : 'bg-white font-normal'
      )}
    >
      {children}
    </button>
  )
}

function RecommendationItem({
  recommendation,
  showMenu,
  onMenuClick,
  rowClassName,
}: {
  recommendation: Recommendation
  showMenu?: boolean
  onMenuClick?: () => void
  rowClassName?: string
}) {
  const { member, content, profile } = recommendation

  // TODO: BE required 처리 후 type narrowing 필요. member/profile/content는 카드 표시값인데 optional emit이라 빈값으로 silent fallback 중.
  return (
    <ProfileCard
      as="li"
      className={rowClassName}
      avatarUrl={member?.picture || DEFAULT_PROFILE_IMAGE}
      name={member?.name ?? ''}
      profileHref={`/profile/${member?.id ?? ''}`}
      meta={{
        region: profile?.address?.city ?? '',
        trade: profile?.primaryTrade ? getTradeLabel(profile.primaryTrade) : '',
        role: profile?.role ? getRoleLabel(profile.role) : undefined,
      }}
      description={content}
      rightSlot={
        showMenu ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="추천서 작업"
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center self-start text-gray-500"
          >
            <MoreVerticalIcon size={16} />
          </button>
        ) : undefined
      }
    />
  )
}

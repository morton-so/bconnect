'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button, CertTag, serverErrorMessage, SkillTag, toast } from '@bconnect/ui'
import { ROLE_LABELS, TRADE_LABELS, useAuthHint, useCreateDirectChat } from '@bconnect/api-client'
import { usePanelNav } from '@/hooks/usePanelNav'
import type { MemberTechnicianItem } from '@/hooks/useTechnicianItems'
import type { Trade } from '@bconnect/api-client'
import { useLoginGate } from './LoginGateProvider'

function Stat({
  value,
  label,
  href,
  onGated,
}: {
  value: number
  label: string
  href: string
  onGated?: () => void
}) {
  const inner = (
    <>
      <span className="text-sb-24 text-gray-900">{value}</span>
      <span className="text-r-14 text-gray-500">{label}</span>
    </>
  )
  const className = 'flex flex-col items-center gap-1'
  if (onGated) {
    return (
      <button type="button" onClick={onGated} className={className}>
        {inner}
      </button>
    )
  }
  return (
    <Link href={href} scroll={false} className={className}>
      {inner}
    </Link>
  )
}

// 3개 기준 폭 고정 (135 ≈ (422 - 2*9) / 3). 1-2개여도 동일 크기 유지.
function PortfolioThumb({ imageUrl, daysRequired }: { imageUrl?: string; daysRequired?: number }) {
  return (
    <div className="flex w-[135px] shrink-0 flex-col items-end gap-1.5">
      <div className="relative aspect-square w-full overflow-hidden rounded-[9px] bg-gray-100">
        {imageUrl && <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />}
      </div>
      <span className="text-r-14 text-gray-500">
        {daysRequired ? `${daysRequired}일 소요` : ' '}
      </span>
    </div>
  )
}

interface TechnicianCardProps {
  item: MemberTechnicianItem
}

export function TechnicianCard({ item }: TechnicianCardProps) {
  const { requireLogin } = useLoginGate()
  const isAuthenticated = useAuthHint()
  const { panelHref, openPanel } = usePanelNav()
  const profileHref = panelHref(`profile/${item.memberId}`)
  const gated = isAuthenticated ? undefined : requireLogin
  const { mutate: createDirectChat, isPending: isCreatingChat } = useCreateDirectChat<Error>()

  const metaParts = [
    item.location,
    item.role && ROLE_LABELS[item.role],
    item.experienceYears > 0 ? `${item.experienceYears}년` : '신입',
  ].filter(Boolean)

  const portfolios =
    item.portfolios.length > 0
      ? item.portfolios.slice(0, 3)
      : Array.from({ length: 3 }, () => ({ imageUrl: '', daysRequired: 0 }))

  return (
    <div className="flex gap-[27px] rounded-[13px] border border-gray-300 bg-white p-7">
      <div className="flex flex-1 gap-[18px]">
        <div className="relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-full bg-gray-100">
          <Image src={item.picture} alt={item.name} fill className="object-cover" unoptimized />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-baseline gap-2.5">
            <p className="text-sb-20 text-gray-900">{item.name}</p>
            <p className="text-r-14 text-gray-500">{metaParts.join(' · ')}</p>
          </div>

          {item.headline && <p className="line-clamp-2 text-r-16 text-gray-900">{item.headline}</p>}

          {/* 공종 + 자격 증명 태그 — Figma 1470:6779 그룹 (내부 gap 7.85 ≈ gap-2) */}
          {(item.trades.length > 0 || item.certifications.length > 0) && (
            <div className="flex flex-col gap-2">
              {item.trades.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.trades.map((trade: Trade) => (
                    <SkillTag
                      key={trade}
                      label={TRADE_LABELS[trade] ?? trade}
                      selected={trade === item.primaryTrade}
                    />
                  ))}
                </div>
              )}

              {/* TODO: 타인 프로필 credentials 조회 API 미구현 — 연동 전까진 빈 목록 */}
              {item.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.certifications.map((cert) => (
                    <CertTag key={cert} label={cert} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 — Figma 카드: h-40 w-full. design system Button 의 'full' size 는 h-50 이라 h-40 override. */}
          <div className="mt-auto flex gap-2.5">
            {isAuthenticated ? (
              <Button asChild variant="outline" size="full" className="h-10">
                <Link href={profileHref} scroll={false}>
                  프로필 보기
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="full" className="h-10" onClick={requireLogin}>
                프로필 보기
              </Button>
            )}
            {isAuthenticated ? (
              <Button
                size="full"
                className="h-10"
                disabled={isCreatingChat}
                onClick={() =>
                  createDirectChat(
                    { data: { memberId: item.memberId } },
                    {
                      onSuccess: (chatId) => openPanel(`messages/${chatId}`),
                      onError: (error) =>
                        toast({ description: serverErrorMessage(error), variant: 'error' }),
                    }
                  )
                }
              >
                메시지 보내기
              </Button>
            ) : (
              <Button size="full" className="h-10" onClick={requireLogin}>
                메시지 보내기
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="w-px shrink-0 self-stretch bg-gray-100" />

      <div className="flex w-[422px] shrink-0 flex-col gap-[22px]">
        <div className="flex gap-8">
          <Stat
            value={item.postCount}
            label="작업물"
            href={panelHref(`profile/${item.memberId}`, { tab: 'works' })}
            onGated={gated}
          />
          <Stat
            value={item.coworkerCount}
            label="동료"
            href={panelHref(`profile/${item.memberId}/coworkers`)}
            onGated={gated}
          />
          <Stat
            value={item.recommendCount}
            label="추천서"
            href={panelHref(`profile/${item.memberId}/recommendations`)}
            onGated={gated}
          />
        </div>

        <div className="flex flex-1 gap-[9px]">
          {portfolios.map((p, i) => (
            <PortfolioThumb
              key={i}
              imageUrl={p.imageUrl || undefined}
              daysRequired={p.daysRequired || undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

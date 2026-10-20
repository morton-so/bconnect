'use client'

import Link from 'next/link'
import { Button, SkillTag } from '@bconnect/ui'
import { ROLE_LABELS, TRADE_LABELS } from '@bconnect/api-client'
import type { Trade } from '@bconnect/api-client'
import { usePanelNav } from '@/hooks/usePanelNav'
import type { CrawledTechnicianItem } from '@/hooks/useTechnicianItems'
import { CrawledImage, CrawledSourceBadge } from './CrawledImage'

/**
 * @figma-todo 크롤링 기술자 카드 디자인 미정
 */

interface CrawledTechnicianCardProps {
  item: CrawledTechnicianItem
}

export function CrawledTechnicianCard({ item }: CrawledTechnicianCardProps) {
  const { panelHref } = usePanelNav()
  const detailHref = panelHref(`crawled/${item.crawledId}`)

  const metaParts = [
    item.company !== item.name ? item.company : null,
    item.location,
    item.role && ROLE_LABELS[item.role],
    item.experienceYears != null && item.experienceYears > 0 ? `${item.experienceYears}년` : null,
  ].filter(Boolean)

  return (
    <div className="flex gap-[27px] rounded-[13px] border border-gray-300 bg-white p-7">
      <div className="flex flex-1 gap-[18px]">
        <div className="relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-full bg-gray-100">
          {item.picture && (
            <CrawledImage
              src={item.picture}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2.5">
              <p className="text-sb-20 text-gray-900">{item.name}</p>
              <p className="text-r-14 text-gray-500">{metaParts.join(' · ')}</p>
            </div>
            <CrawledSourceBadge />
          </div>

          {item.headline && <p className="line-clamp-2 text-r-16 text-gray-900">{item.headline}</p>}

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

          <div className="mt-auto flex gap-2.5">
            <Button asChild variant="outline" size="full" className="h-10">
              <Link href={detailHref} scroll={false}>
                프로필 보기
              </Link>
            </Button>
            {item.phone ? (
              <Button asChild size="full" className="h-10">
                <a href={`tel:${item.phone}`}>전화 문의</a>
              </Button>
            ) : (
              item.sourceUrl && (
                <Button asChild size="full" className="h-10">
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                    블로그 보기
                  </a>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

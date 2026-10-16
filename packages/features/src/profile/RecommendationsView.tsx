'use client'

import type { Recommendation } from '@bconnect/api-client'
import { PanelShell } from '../PanelShell'
import { PanelScroll } from '../PanelScroll'
import { PanelMessage } from '../PanelMessage'
import { RecommendationList } from './RecommendationList'

export interface RecommendationsViewData {
  received?: Recommendation[]
  sent?: Recommendation[]
  isError: boolean
}

export interface RecommendationsViewProps {
  data: RecommendationsViewData
  closeHref: string
  onClose: () => void
  backHref: string
}

export function RecommendationsView({
  data,
  closeHref,
  onClose,
  backHref,
}: RecommendationsViewProps) {
  return (
    <PanelShell
      title="추천서"
      backHref={backHref}
      backLabel="프로필"
      closeLabel="추천서 패널 닫기"
      closeHref={closeHref}
      onClose={onClose}
    >
      <PanelScroll>
        {data.isError ? (
          <PanelMessage>추천서를 불러올 수 없습니다</PanelMessage>
        ) : (
          <RecommendationList received={data.received} sent={data.sent} variant="full" />
        )}
      </PanelScroll>
    </PanelShell>
  )
}

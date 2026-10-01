/**
 * @figma-todo 타인 추천서 페이지 본인 화면 재사용
 */
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useGetReceivedRecommendations, useGetSentRecommendations } from '@bconnect/api-client'
import { TopBar } from '@bconnect/ui'
import { RecommendationList } from '@bconnect/features'

export default function MemberRecommendationsPage() {
  const params = useParams<{ memberId: string }>()
  const memberId = Number(params.memberId)
  const router = useRouter()
  const enabled = Number.isFinite(memberId) && memberId > 0

  const { data: received } = useGetReceivedRecommendations({ memberId }, { query: { enabled } })
  const { data: sent } = useGetSentRecommendations({ memberId }, { query: { enabled } })

  return (
    <div className="flex flex-col">
      <TopBar variant="default" title="추천서" onBack={() => router.back()} />
      {/* 타인 추천서 — 읽기 전용 (숨김/삭제 미주입) */}
      <RecommendationList received={received} sent={sent} variant="full" />
    </div>
  )
}

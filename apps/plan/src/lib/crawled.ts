import { REGION_LABELS, ROLE_LABELS, WORKER_ROLE } from '@bconnect/api-client'
import type { CrawledMember, CrawledMemberSummary, Trade, WorkerRole } from '@bconnect/api-client'

export interface CrawledDisplay {
  displayName: string
  companySub: string | null
  location: string
  trades: Trade[]
  primaryTrade?: Trade
  role?: WorkerRole
  experienceYears?: number
  headline: string
  phone: string
  sourceUrl: string
}

export function toCrawledDisplay(crawled: CrawledMemberSummary | CrawledMember): CrawledDisplay {
  const profile = crawled.profile
  const displayName = crawled.name || crawled.company || ''
  const trades = (profile?.trades ?? []) as Trade[]
  const primaryTrade = profile?.primaryTrade ? (profile.primaryTrade as Trade) : undefined
  const sortedTrades =
    primaryTrade && trades.includes(primaryTrade)
      ? [primaryTrade, ...trades.filter((t) => t !== primaryTrade)]
      : trades
  return {
    displayName,
    companySub: crawled.company && crawled.company !== displayName ? crawled.company : null,
    location: profile?.state ? (REGION_LABELS[profile.state] ?? '') : '',
    trades: sortedTrades,
    primaryTrade,
    role: WORKER_ROLE.find((r) => ROLE_LABELS[r] === crawled.role),
    experienceYears: profile?.experience ?? undefined,
    headline: profile?.headline ?? '',
    phone: crawled.phone ?? '',
    sourceUrl: profile?.url ?? '',
  }
}

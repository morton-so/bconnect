'use client'

import { useMemo } from 'react'
import {
  regionOfState,
  useGetCrawledMembers,
  useGetFeeds,
  useGetProfiles,
  WORKER_ROLE,
} from '@bconnect/api-client'
import type {
  CrawledMemberSummary,
  Feed,
  Profile,
  Region,
  Trade,
  WorkerRole,
} from '@bconnect/api-client'
import { toWork } from '@bconnect/features'
import { DEFAULT_PROFILE_IMAGE } from '@bconnect/lib/avatar'
import { toCrawledDisplay } from '@/lib/crawled'
import type { ExperienceLevel } from '@/lib/experience'
import { EXPERIENCE_RANGES } from '@/lib/experience'

interface TechnicianItemBase {
  name: string
  picture: string
  location: string
  region?: Region
  primaryTrade?: Trade
  experienceYears?: number
  headline: string
  trades: Trade[]
  role?: WorkerRole
  postCount: number
  coworkerCount: number
  recommendCount: number
  rating: number
  reviewCount: number
  contractCount: number
  certifications: string[]
  portfolios: { imageUrl: string; daysRequired?: number }[]
}

export interface MemberTechnicianItem extends TechnicianItemBase {
  source: 'member'
  profileId: number
  memberId: number
  experienceYears: number
}

export interface CrawledTechnicianItem extends TechnicianItemBase {
  source: 'crawled'
  crawledId: number
  phone: string
  sourceUrl: string
  company: string
}

export type TechnicianItem = MemberTechnicianItem | CrawledTechnicianItem

function toTechnicianItem(profile: Profile, feeds: Feed[]): MemberTechnicianItem | null {
  const profileId = profile.id
  const memberId = profile.member?.id
  if (profileId == null || memberId == null) return null

  const name = profile.member?.name ?? ''
  return {
    source: 'member',
    profileId,
    memberId,
    name,
    picture: profile.member?.picture ?? DEFAULT_PROFILE_IMAGE,
    location: profile.address?.city ?? '',
    region: regionOfState(profile.address?.state),
    primaryTrade: profile.primaryTrade,
    experienceYears: profile.experience ?? 0,
    headline: profile.headline ?? '',
    trades: profile.trades ?? [],
    role: WORKER_ROLE.find((r) => r === profile.role),
    postCount: profile.postCount ?? 0,
    coworkerCount: profile.coworkerCount ?? 0,
    recommendCount: profile.recommendationCount ?? 0,
    rating: 0,
    reviewCount: 0,
    contractCount: 0,
    certifications: [],
    portfolios: feeds.slice(0, 3).map((feed) => {
      const { images, days } = toWork(feed)
      return { imageUrl: images[0] ?? '', daysRequired: days }
    }),
  }
}

function toCrawledItem(crawled: CrawledMemberSummary): CrawledTechnicianItem | null {
  const crawledId = crawled.id
  if (crawledId == null) return null

  const d = toCrawledDisplay(crawled)
  return {
    source: 'crawled',
    crawledId,
    name: d.displayName,
    picture: crawled.picture ?? DEFAULT_PROFILE_IMAGE,
    location: d.location,
    region: crawled.profile?.state ?? undefined,
    primaryTrade: d.primaryTrade,
    experienceYears: d.experienceYears,
    headline: d.headline,
    trades: d.trades,
    role: d.role,
    postCount: 0,
    coworkerCount: 0,
    recommendCount: 0,
    rating: 0,
    reviewCount: 0,
    contractCount: 0,
    certifications: [],
    portfolios: [],
    phone: d.phone,
    sourceUrl: d.sourceUrl,
    company: crawled.company ?? '',
  }
}

interface UseTechnicianItemsOptions {
  trades?: Trade[] | null
  experience?: ExperienceLevel | null
  roles?: WorkerRole[] | null
  regions?: Region[] | null
}

export function useTechnicianItems({
  trades,
  experience,
  roles,
  regions,
}: UseTechnicianItemsOptions = {}) {
  const { data, isLoading: isMembersLoading, error } = useGetProfiles()
  const { data: feeds } = useGetFeeds()
  const { data: crawledMembers, isLoading: isCrawledLoading } = useGetCrawledMembers()
  const isLoading = isMembersLoading || isCrawledLoading

  const feedsByMember = useMemo(() => {
    const map = new Map<number, Feed[]>()
    for (const feed of feeds?.content ?? []) {
      const memberId = feed.member?.id
      if (memberId == null || !feed.post) continue
      const authoredFeeds = map.get(memberId) ?? []
      authoredFeeds.push(feed)
      map.set(memberId, authoredFeeds)
    }
    return map
  }, [feeds])

  const allItems: TechnicianItem[] = useMemo(
    () => [
      ...(data?.content ?? []).flatMap(
        (profile) =>
          toTechnicianItem(profile, feedsByMember.get(profile.member?.id ?? -1) ?? []) ?? []
      ),
      ...(crawledMembers?.content ?? []).flatMap((crawled) => toCrawledItem(crawled) ?? []),
    ],
    [data, feedsByMember, crawledMembers]
  )

  const expRange = experience ? EXPERIENCE_RANGES[experience] : undefined

  const items: TechnicianItem[] = useMemo(() => {
    return allItems.filter((item) => {
      // 공종 다중 선택 — 선택된 공종 중 하나라도 보유하면 통과 (OR)
      if (trades && trades.length > 0 && !trades.some((t) => item.trades.includes(t))) return false
      if (roles && roles.length > 0 && (!item.role || !roles.includes(item.role))) return false
      if (expRange != null) {
        if (item.experienceYears == null) return false
        if (item.experienceYears < expRange.min) return false
        if (expRange.max != null && item.experienceYears > expRange.max) return false
      }
      if (regions && regions.length > 0 && (!item.region || !regions.includes(item.region)))
        return false
      return true
    })
  }, [allItems, trades, expRange, roles, regions])

  const memberCount = useMemo(
    () => allItems.reduce((n, item) => (item.source === 'member' ? n + 1 : n), 0),
    [allItems]
  )

  return { items, totalCount: allItems.length, memberCount, isLoading, error }
}

'use client'

import { useMemo } from 'react'
import {
  regionOfState,
  REGION_LABELS,
  ROLE_LABELS,
  TRADE_LABELS,
  useAuthHint,
  useGetFeeds,
  useGetMyMember,
} from '@bconnect/api-client'
import type { Trade, ProfileRole, Region } from '@bconnect/api-client'
import { toWork } from '@bconnect/features'
import { formatRelativeTime } from '@bconnect/lib/date'
import { DEFAULT_PROFILE_IMAGE } from '@bconnect/lib/avatar'

export interface FeedItem {
  postId: number
  memberId?: number
  isMine: boolean
  profile: {
    image: string
    name: string
    location: string
    jobType: string
    specialty: string
    bio: string
  }
  content: {
    images: string[]
    imageAlt?: string
    company?: string
    duration?: string
    timestamp: string
    description: string
  }
}

interface UseFeedItemsOptions {
  trades?: Trade[]
  roles?: ProfileRole[]
  regions?: Region[]
  minExperience?: number
  maxExperience?: number
  authorId?: number
  limit?: number
}

export function useFeedItems({
  trades,
  roles,
  regions,
  minExperience,
  maxExperience,
  authorId,
}: UseFeedItemsOptions = {}) {
  const { data: feeds, isLoading, error } = useGetFeeds()
  const isAuthenticated = useAuthHint()
  const currentUserId = useGetMyMember({ query: { enabled: isAuthenticated } }).data?.id

  // TODO: null 처리 필요
  const feedItems: FeedItem[] = useMemo(() => {
    if (!feeds?.content) return []

    return feeds.content.flatMap((feed): FeedItem[] => {
      const { member, profile, post } = feed

      const memberId = member?.id
      const postId = post?.id
      if (!member || !profile || !post || memberId == null || postId == null) return []

      const role = profile.role
      const region = regionOfState(profile.address?.state)
      const { primaryTrade } = profile

      // 대표 분야 기준 필터링
      if (trades?.length && (!primaryTrade || !trades.includes(primaryTrade))) return []
      if (roles?.length && (role == null || !roles.includes(role))) return []
      if (regions?.length && (region == null || !regions.includes(region))) return []
      if (minExperience != null && (profile.experience ?? 0) < minExperience) return []
      if (maxExperience != null && (profile.experience ?? 0) > maxExperience) return []
      if (authorId != null && memberId !== authorId) return []

      const work = toWork(feed)

      return [
        {
          postId,
          memberId,
          isMine: currentUserId != null && memberId === currentUserId,
          profile: {
            image: member.picture || DEFAULT_PROFILE_IMAGE,
            name: member.name ?? '',
            location: region ? REGION_LABELS[region] : '',
            jobType: role ? ROLE_LABELS[role] : '',
            specialty: primaryTrade ? (TRADE_LABELS[primaryTrade] ?? '') : '',
            bio: profile.headline ?? '',
          },
          content: {
            images: work.images.length ? work.images : ['/images/placeholder-post.svg'],
            company: work.company,
            duration: work.duration,
            timestamp: post.createdAt ? formatRelativeTime(post.createdAt) : '',
            description: post.content ?? '',
          },
        },
      ]
    })
  }, [feeds, trades, roles, regions, minExperience, maxExperience, authorId, currentUserId])

  return {
    feedItems,
    postCount: feedItems.length,
    isLoading,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: () => {},
    error,
  }
}

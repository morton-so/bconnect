import { postImageUrls } from '@bconnect/api-client'
import type { Feed } from '@bconnect/api-client'
import { durationDays, formatDays } from '@bconnect/config/date'

export interface Work {
  images: string[]
  company?: string
  days?: number
  duration?: string
}

export function toWork(feed: Pick<Feed, 'post' | 'task'>): Work {
  const { post, task } = feed
  const days = task ? durationDays(task.start, task.end) : undefined
  return {
    images: post ? postImageUrls(post) : [],
    company: task?.company ?? undefined,
    days,
    duration: days == null ? undefined : formatDays(days),
  }
}

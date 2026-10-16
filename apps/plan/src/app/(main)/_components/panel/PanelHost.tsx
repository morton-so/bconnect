'use client'

import { useSearchParams } from 'next/navigation'
import { PanelCrawled } from './PanelCrawled'
import { PanelProfile } from './PanelProfile'
import { PanelCoworkers } from './PanelCoworkers'
import { PanelRecommendations } from './PanelRecommendations'
import { PanelMessages } from './PanelMessages'
import { PanelChat } from './PanelChat'
import { PanelNotifications } from './PanelNotifications'
import { PanelTask } from './PanelTask'

export function PanelHost() {
  const panel = useSearchParams().get('panel')
  if (!panel) return null

  const seg = panel.split('/')

  if (seg[0] === 'profile') {
    const profileId = Number(seg[1])
    if (!Number.isFinite(profileId) || profileId <= 0) return null
    if (seg[2] === 'coworkers') return <PanelCoworkers profileId={profileId} />
    if (seg[2] === 'recommendations') return <PanelRecommendations profileId={profileId} />
    return <PanelProfile profileId={profileId} />
  }

  if (seg[0] === 'crawled') {
    const crawledId = Number(seg[1])
    if (!Number.isFinite(crawledId) || crawledId <= 0) return null
    return <PanelCrawled crawledId={crawledId} />
  }

  if (seg[0] === 'messages') {
    if (seg[1] === undefined) return <PanelMessages />
    const chatId = Number(seg[1])
    if (!Number.isFinite(chatId) || chatId <= 0) return null
    return <PanelChat chatId={chatId} />
  }

  if (seg[0] === 'notifications') return <PanelNotifications />

  if (seg[0] === 'task') {
    if (seg[1] === 'new') return <PanelTask key="new" />
    const taskId = Number(seg[1])
    if (!seg[1] || !Number.isInteger(taskId) || taskId < 0) return null
    return <PanelTask key={taskId} taskId={taskId} />
  }

  return null
}

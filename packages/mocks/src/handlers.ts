import { getBconnectAPIMock } from '@bconnect/api-client/msw'
import { delay, http } from 'msw'
import { authOverrides } from './overrides/auth'
import { chatSocketOverrides } from './overrides/chat-socket'
import { chatsOverrides } from './overrides/chats'
import { coworkersOverrides } from './overrides/coworkers'
import { crawledOverrides } from './overrides/crawled'
import { credentialsOverrides } from './overrides/credentials'
import { drivesOverrides } from './overrides/drives'
import { feedsOverrides } from './overrides/feeds'
import { membersOverrides } from './overrides/members'
import { notificationsOverrides } from './overrides/notifications'
import { profilesOverrides } from './overrides/profiles'
import { recommendationsOverrides } from './overrides/recommendations'
import { scheduleOverrides } from './overrides/schedule'
import { tasksOverrides } from './overrides/tasks'

const globalDelay = http.all('*', async ({ request }) => {
  if (!new URL(request.url).pathname.includes('/api/')) return
  await delay(2000)
})

export const handlers = [
  globalDelay,
  ...authOverrides,
  ...chatSocketOverrides,
  ...chatsOverrides,
  ...coworkersOverrides,
  ...crawledOverrides,
  ...credentialsOverrides,
  ...drivesOverrides,
  ...feedsOverrides,
  ...membersOverrides,
  ...notificationsOverrides,
  ...profilesOverrides,
  ...recommendationsOverrides,
  ...scheduleOverrides,
  ...tasksOverrides,
  ...getBconnectAPIMock(),
]

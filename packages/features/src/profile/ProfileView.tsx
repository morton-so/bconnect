'use client'

import type { ReactNode } from 'react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import type {
  CredentialSummary,
  MemberSummary,
  Profile,
  Recommendation,
} from '@bconnect/api-client'
import { Skeleton, Tab } from '@bconnect/ui'
import { PanelShell } from '../PanelShell'
import { PanelScroll } from '../PanelScroll'
import { PanelMessage } from '../PanelMessage'
import { ProfileSummary, type ProfileStatHrefs } from './ProfileSummary'
import { IntroTab, type ProfileEditHrefs } from './IntroTab'
import { WorksTab } from './WorksTab'

type TabKey = 'intro' | 'works'

const TAB_ITEMS = [
  { key: 'intro', label: '소개' },
  { key: 'works', label: '작업물' },
]

export interface ProfileViewData {
  member?: MemberSummary
  profile?: Profile
  postCount?: number
  coworkerCount?: number
  recommendationCount?: number
  credentials?: CredentialSummary[]
  receivedRecommendations?: Recommendation[]
  sentRecommendations?: Recommendation[]
  isLoading: boolean
  isError: boolean
}

interface ProfileViewBaseProps {
  profileId: number
  data: ProfileViewData
  actionSlot?: ReactNode
  editHrefs?: ProfileEditHrefs
  statHrefs?: ProfileStatHrefs
  workEditHref?: (postId: number) => string
  onDeleteWork?: (postId: number) => void
  onHideRecommendation?: (id: number) => void
  onDeleteRecommendation?: (id: number) => void
  fallbackTitle?: string
  onEditImage?: () => void
  imageUploading?: boolean
}

type ProfileViewShellProps =
  | {
      renderShell: (props: { title: string; children: ReactNode }) => ReactNode
      closeHref?: never
      onClose?: never
    }
  | {
      renderShell?: never
      closeHref: string
      onClose: () => void
    }

export type ProfileViewProps = ProfileViewBaseProps & ProfileViewShellProps

export function ProfileView(props: ProfileViewProps) {
  const {
    profileId,
    data,
    actionSlot,
    editHrefs,
    statHrefs,
    workEditHref,
    onDeleteWork,
    onHideRecommendation,
    onDeleteRecommendation,
    fallbackTitle,
    onEditImage,
    imageUploading,
  } = props
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<TabKey>(['intro', 'works']).withDefault('intro')
  )

  const { member, profile } = data
  // TODO: BE required 처리 후 type narrowing 필요. MemberSummary username/name이 optional emit이라 셸 타이틀 fallback에 의존 중.
  const title = member?.username ?? member?.name ?? fallbackTitle ?? '프로필'

  const body = (
    <PanelScroll>
      {data.isLoading ? (
        <ProfileSkeleton />
      ) : data.isError || !profile ? (
        <PanelMessage>프로필을 불러올 수 없습니다</PanelMessage>
      ) : (
        <>
          <ProfileSummary
            member={member}
            profile={profile}
            postCount={data.postCount}
            coworkerCount={data.coworkerCount}
            recommendationCount={data.recommendationCount}
            statHrefs={statHrefs}
            statScroll={props.renderShell ? undefined : false}
            onEditImage={onEditImage}
            imageUploading={imageUploading}
          />
          {actionSlot}
          <Tab items={TAB_ITEMS} activeKey={tab} onChange={(key) => setTab(key as TabKey)} />
          {tab === 'intro' ? (
            <IntroTab
              profile={profile}
              credentials={data.credentials}
              receivedRecommendations={data.receivedRecommendations}
              sentRecommendations={data.sentRecommendations}
              editHrefs={editHrefs}
              onHideRecommendation={onHideRecommendation}
              onDeleteRecommendation={onDeleteRecommendation}
            />
          ) : (
            <WorksTab
              profileId={profileId}
              workEditHref={workEditHref}
              onDeleteWork={onDeleteWork}
            />
          )}
        </>
      )}
    </PanelScroll>
  )

  if (props.renderShell) {
    return <>{props.renderShell({ title, children: body })}</>
  }

  return (
    <PanelShell
      title={member?.username}
      closeLabel="프로필 패널 닫기"
      closeHref={props.closeHref}
      onClose={props.onClose}
    >
      {body}
    </PanelShell>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-[100px] w-[100px] shrink-0 rounded-full" />
        <div className="flex flex-1 justify-around gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-12" />
          ))}
        </div>
      </div>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

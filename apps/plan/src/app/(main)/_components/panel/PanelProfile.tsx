'use client'

import {
  useGetProfile,
  useGetCredentials,
  useGetReceivedRecommendations,
  useGetSentRecommendations,
} from '@bconnect/api-client'
import { ProfileView, PanelAside, type ProfileViewData } from '@bconnect/features'
import { useSearchParams } from 'next/navigation'
import { usePanelNav } from '@/hooks/usePanelNav'
import { useSelectedTask } from '@/hooks/useSelectedTask'
import { OfferProposeButton } from '../offer/OfferProposeButton'

export function PanelProfile({ profileId }: { profileId: number }) {
  const { panelHref, closeHref, close } = usePanelNav()
  const searchParams = useSearchParams()
  const { taskId } = useSelectedTask()

  const enabled = Number.isFinite(profileId) && profileId > 0
  const { data: profile, isLoading, isError } = useGetProfile(profileId, { query: { enabled } })
  const { data: credentials } = useGetCredentials({ memberId: profileId }, { query: { enabled } })
  const { data: received } = useGetReceivedRecommendations(
    { memberId: profileId },
    { query: { enabled } }
  )
  const { data: sent } = useGetSentRecommendations({ memberId: profileId }, { query: { enabled } })

  const worksParams = new URLSearchParams(searchParams.toString())
  worksParams.set('tab', 'works')

  // TODO: BE required 처리 후 type narrowing 필요. Profile.member/counts가 optional emit.
  const member = profile?.member

  const data: ProfileViewData = {
    member,
    profile,
    postCount: profile?.postCount,
    coworkerCount: profile?.coworkerCount,
    recommendationCount: profile?.recommendationCount,
    credentials,
    receivedRecommendations: received,
    sentRecommendations: sent,
    isLoading,
    isError,
  }

  return (
    <PanelAside label="기술자 프로필">
      <ProfileView
        profileId={profileId}
        data={data}
        closeHref={closeHref}
        onClose={close}
        actionSlot={
          taskId != null ? (
            <div className="px-4 pb-2">
              <OfferProposeButton taskId={taskId} profileId={profileId} disabled={!member} />
            </div>
          ) : undefined
        }
        statHrefs={{
          works: `?${worksParams.toString()}`,
          coworkers: panelHref(`profile/${profileId}/coworkers`),
          recommendations: panelHref(`profile/${profileId}/recommendations`),
        }}
      />
    </PanelAside>
  )
}

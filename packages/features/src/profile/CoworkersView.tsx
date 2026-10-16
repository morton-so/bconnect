'use client'

import type { Coworker } from '@bconnect/api-client'
import { PanelShell } from '../PanelShell'
import { PanelScroll } from '../PanelScroll'
import { CoworkerList } from './CoworkerList'

export interface CoworkersViewData {
  coworkers?: Coworker[]
  isLoading: boolean
  isError: boolean
}

export interface CoworkersViewProps {
  data: CoworkersViewData
  closeHref: string
  onClose: () => void
  backHref: string
  coworkerHref: (profileId: number) => string
}

export function CoworkersView({
  data,
  closeHref,
  onClose,
  backHref,
  coworkerHref,
}: CoworkersViewProps) {
  const { coworkers, isLoading, isError } = data

  return (
    <PanelShell
      title="동료"
      backHref={backHref}
      backLabel="프로필"
      closeLabel="동료 패널 닫기"
      closeHref={closeHref}
      onClose={onClose}
    >
      <PanelScroll>
        <CoworkerList
          coworkers={coworkers}
          isLoading={isLoading}
          isError={isError}
          coworkerHref={coworkerHref}
        />
      </PanelScroll>
    </PanelShell>
  )
}

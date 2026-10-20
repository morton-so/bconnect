import type { ReferencePathMap } from '@bconnect/features'

export const REFERENCE_PANEL_SEGMENTS: ReferencePathMap = {
  CHAT_ROOM: 'messages/{id}',
  // TODO: OFFER: 목적지는 작업 패널의 섭외 대기열(PanelTask)이지만, referenceId 가 offerId 라
  //       어느 작업인지 지목하려면 조회가 한 번 더 필요하다.
}

export const REFERENCE_PATHS: ReferencePathMap = Object.fromEntries(
  Object.entries(REFERENCE_PANEL_SEGMENTS).map(([type, segment]) => [type, `?panel=${segment}`])
)

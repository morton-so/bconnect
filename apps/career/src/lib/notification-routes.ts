import type { ReferencePathMap } from '@bconnect/features'

/** 알림 유형에 따른 리다이렉트 경로 */
export const REFERENCE_PATHS: ReferencePathMap = {
  CHAT_ROOM: '/messages/{id}',
  PROFILE: '/profile',
  COWORKER_REQUEST: '/profile/coworkers',
  CREDENTIAL: '/profile/certifications',
  RECOMMENDATION: '/profile/recommendations',
  // OFFER: TODO
  // CONTRACT: TODO
}

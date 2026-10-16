import { CoworkerStatus, ProfileRole, Trade } from '@bconnect/api-client'
import {
  getGetMyProfileMockHandler,
  getGetProfileMockHandler,
  getGetProfilesMockHandler,
} from '@bconnect/api-client/msw'
import type {
  CursorPageProfile,
  MemberSummary,
  Profile,
  ProfileDetail,
  Region,
} from '@bconnect/api-client'

const EPOCH = '2025-01-02T00:00:00.000Z'

const HEADLINE = '안녕하세요, 타일 준기공 이송목입니다. 믿고 맡겨주신다면 성실히 임하겠습니다.'

const ABOUT = `안녕하세요, 타일 준기공 이송목입니다. 수입타일을 전문으로 시공하고 있습니다.
바닥, 벽면, 욕실 타일 모두 작업 가능하며, 줄눈 정밀도와 평탄 마감에 자신 있습니다.

시공문의
010-8335-8632
lsm3645@g.skku.edu

#타일 #수입타일 #욕실타일 #바닥타일`

const memberOf = (id: number, username: string, name: string): MemberSummary => ({
  id,
  username,
  name,
  picture: null,
})

export interface ProfileSeed {
  id: number
  username: string
  name: string
  role: ProfileRole
  trade: Trade
  experience: number
  postCount: number
  headline: string
  about: string
  state: Region
  city: string
}

export const PROFILE_SEEDS: ProfileSeed[] = [
  {
    id: 1,
    postCount: 2,
    username: 'leesongmok',
    name: '이송목',
    role: ProfileRole.SEMI_SKILLED,
    trade: Trade.TILING,
    experience: 3,
    headline: HEADLINE,
    about: ABOUT,
    state: '경기',
    city: '수원시 장안구',
  },
  {
    id: 101,
    postCount: 2,
    username: 'worker_101',
    name: '이송목',
    role: ProfileRole.SEMI_SKILLED,
    trade: Trade.WALLPAPER,
    experience: 8,
    headline: '도배 준기공',
    about: '안녕하세요, 도배 준기공 이송목입니다.\n믿고 맡겨주신다면 성실히 임하겠습니다.',
    state: '경기',
    city: '용인시 기흥구',
  },
  {
    id: 102,
    postCount: 1,
    username: 'worker_102',
    name: '박전기',
    role: ProfileRole.SKILLED,
    trade: Trade.ELECTRICAL,
    experience: 12,
    headline: '전기 기공',
    about: '전기 공사 12년 경력입니다.\n현장 안전 최우선으로 작업합니다.',
    state: '서울',
    city: '강남구',
  },
  {
    id: 103,
    postCount: 1,
    username: 'worker_103',
    name: '최타일',
    role: ProfileRole.FOREMAN,
    trade: Trade.TILING,
    experience: 5,
    headline: '타일 시공',
    about: '타일·방수 전문입니다.\n견적 문의 편하게 주세요.',
    state: '인천',
    city: '남동구',
  },
]

const profileOf = (seed: ProfileSeed): Profile => ({
  id: seed.id,
  member: memberOf(seed.id, seed.username, seed.name),
  role: seed.role,
  primaryTrade: seed.trade,
  trades: [seed.trade],
  experience: seed.experience,
  headline: seed.headline,
  about: seed.about,
  address: {
    zipcode: '00000',
    bcode: '0000000000',
    city: seed.city,
    state: seed.state,
    street: '○○로 12',
    latitude: 37.5,
    longitude: 127.0,
  },
  postCount: seed.postCount,
  recommendationCount: 0,
  coworkerCount: 0,
  createdAt: EPOCH,
  modifiedAt: EPOCH,
})

const detailOf = (seed: ProfileSeed): ProfileDetail => ({
  ...profileOf(seed),
  status: CoworkerStatus.NONE,
})

const PROFILES_BY_ID: Record<number, ProfileDetail> = Object.fromEntries(
  PROFILE_SEEDS.map((seed) => [seed.id, detailOf(seed)])
)

let myMockPicture: string | null = null

export function setMyMockPicture(pictureId: number) {
  myMockPicture = `https://picsum.photos/seed/bconnect-${pictureId}/200/200`
  const me = PROFILES_BY_ID[1]?.member
  if (me) me.picture = myMockPicture
}

const withMyPicture = (profile: Profile): Profile =>
  myMockPicture && profile.member
    ? { ...profile, member: { ...profile.member, picture: myMockPicture } }
    : profile

const paramId = (value: string | readonly string[] | undefined): number =>
  Number(typeof value === 'string' ? value : (value?.[0] ?? ''))

export const profilesOverrides = [
  getGetProfilesMockHandler((): CursorPageProfile => ({
    content: PROFILE_SEEDS.map((seed) => profileOf(seed)),
    hasNext: false,
    nextCursor: undefined,
  })),
  getGetMyProfileMockHandler(() => withMyPicture(profileOf(PROFILE_SEEDS[0]))),
  getGetProfileMockHandler(({ params }) => PROFILES_BY_ID[paramId(params.id)] ?? PROFILES_BY_ID[1]),
]

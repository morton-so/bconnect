import { OfferStatus, ProfileRole, TaskProgress, TaskStatus, Trade } from '@bconnect/api-client'
import {
  getCancelOfferMockHandler,
  getCreateOfferMockHandler,
  getCreateTaskCompanyMockHandler,
  getGetProjectsMockHandler,
  getGetProjectTasksMockHandler,
  getGetTaskOffersMockHandler,
  getUpdateTaskCompanyMockHandler,
} from '@bconnect/api-client/msw'
import type {
  CompanyTask,
  CreateOfferRequest,
  CreateProjectTaskRequest,
  Offer,
  Project,
  Region,
  ReorderOfferRequest,
  UpdateProjectTaskRequest,
} from '@bconnect/api-client'
import { addressOf } from './_address'
import { http, HttpResponse } from 'msw'

const INVALID_REORDER = {
  success: false,
  error: { code: 'OF003', message: '재정렬 대상이 올바르지 않습니다.' },
}

const pad = (n: number) => String(n).padStart(2, '0')

function isoDaysFromToday(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function nowStamp(): string {
  return new Date().toISOString().slice(0, 19) + 'Z'
}

const seedStamp = nowStamp()

const PROJECT_SEEDS: Project[] = [
  {
    id: 1,
    companyId: 1,
    title: '모튼아파트 리모델링 01 (Mocked)',
    address: addressOf('경기', '수원시 장안구', '경기도 수원시 율전로 00번길 00-00', '000호'),
    createdAt: seedStamp,
    modifiedAt: seedStamp,
  },
  {
    id: 2,
    companyId: 1,
    title: '래미안 리모델링 02 (Mocked)',
    address: addressOf('서울', '강남구', '서울 강남구 테헤란로 00길 00', '0000호'),
    createdAt: seedStamp,
    modifiedAt: seedStamp,
  },
  {
    id: 3,
    companyId: 1,
    title: '자담 사옥 인테리어 (Mocked)',
    address: addressOf('인천', '연수구', '인천 연수구 송도과학로 00', '000호'),
    createdAt: seedStamp,
    modifiedAt: seedStamp,
  },
]

interface PersonSeed {
  name: string
  region: Region
  trade: Trade
}

const CITY_OF_REGION: Partial<Record<Region, string>> = {
  경기: '성남시 분당구',
  서울: '중구',
  인천: '연수구',
}

const PEOPLE: Record<number, PersonSeed> = {
  1: { name: '이송목 (Mocked)', region: '경기', trade: Trade.WALLPAPER },
  2: { name: '손장수 (Mocked)', region: '서울', trade: Trade.ELECTRICAL },
  3: { name: '홍길동 (Mocked)', region: '인천', trade: Trade.CARPENTRY },
  4: { name: '탁재훈 (Mocked)', region: '경기', trade: Trade.TILING },
  5: { name: '송중기 (Mocked)', region: '서울', trade: Trade.FILM_SHEET },
  6: { name: '박세리 (Mocked)', region: '인천', trade: Trade.PAINTING },
  7: { name: '최수종 (Mocked)', region: '경기', trade: Trade.WATERPROOFING },
  21: { name: '김철수 (Mocked)', region: '서울', trade: Trade.DEMOLITION },
  22: { name: '이영희 (Mocked)', region: '경기', trade: Trade.TILING },
  23: { name: '박민수 (Mocked)', region: '인천', trade: Trade.WALLPAPER },
  902: { name: '이민호 (Mocked)', region: '서울', trade: Trade.TILING },
  903: { name: '김태현 (Mocked)', region: '인천', trade: Trade.WALLPAPER },
  904: { name: '박지성 (Mocked)', region: '경기', trade: Trade.TILING },
}

interface TaskSeed {
  id: number
  projectId: number
  trades: Trade[]
  title: string
  startOffset: number
  endOffset: number
  status: CompanyTask['status']
  progress: CompanyTask['progress']
  workerId?: number
  requirement?: string
  memo?: string
  activeOffer?: number
  pendingOffers?: number[]
}

const TASK_SEEDS: TaskSeed[] = [
  {
    id: 8001,
    projectId: 1,
    trades: [Trade.DEMOLITION],
    title: '철거작업',
    startOffset: -6,
    endOffset: -4,
    status: TaskStatus.ASSIGNED,
    progress: TaskProgress.COMPLETED,
    workerId: 1,
  },
  {
    id: 8002,
    projectId: 1,
    trades: [Trade.ELECTRICAL],
    title: '전기 시공',
    startOffset: -3,
    endOffset: -1,
    status: TaskStatus.ASSIGNED,
    progress: TaskProgress.IN_PROGRESS,
    workerId: 2,
  },
  {
    id: 8003,
    projectId: 1,
    trades: [Trade.CARPENTRY, Trade.GLAZING],
    title: '목재/창호 설치',
    startOffset: -1,
    endOffset: 0,
    status: TaskStatus.ASSIGNED,
    progress: TaskProgress.IN_PROGRESS,
    workerId: 3,
  },
  {
    id: 8004,
    projectId: 1,
    trades: [Trade.TILING, Trade.WALLPAPER],
    title: '타일',
    startOffset: 0,
    endOffset: 1,
    status: TaskStatus.ASSIGNED,
    progress: TaskProgress.TODO,
    workerId: 4,
    requirement: '타일 시공 및 단일 벽면 일부 도배',
    memo: '세밀한 작업이 필요함',
    pendingOffers: [902, 903, 904],
  },
  {
    id: 8005,
    projectId: 1,
    trades: [Trade.FILM_SHEET],
    title: '필름',
    startOffset: 2,
    endOffset: 3,
    status: TaskStatus.ASSIGNED,
    progress: TaskProgress.TODO,
    workerId: 5,
  },
  {
    id: 8006,
    projectId: 1,
    trades: [Trade.WALLPAPER],
    title: '도배',
    startOffset: 4,
    endOffset: 5,
    status: TaskStatus.ASSIGNED,
    progress: TaskProgress.TODO,
    workerId: 6,
  },
  {
    id: 8007,
    projectId: 1,
    trades: [Trade.HARDWOOD],
    title: '바닥 및 마무리',
    startOffset: 6,
    endOffset: 7,
    status: TaskStatus.OFFERED,
    progress: TaskProgress.TODO,
    activeOffer: 7,
  },
  {
    id: 8008,
    projectId: 1,
    trades: [Trade.SINK, Trade.FURNITURE],
    title: '가구 설치',
    startOffset: 8,
    endOffset: 9,
    status: TaskStatus.NONE,
    progress: TaskProgress.TODO,
  },
  {
    id: 8009,
    projectId: 1,
    trades: [Trade.ELECTRICAL],
    title: '조명 설치',
    startOffset: 8,
    endOffset: 10,
    status: TaskStatus.NONE,
    progress: TaskProgress.TODO,
  },
  {
    id: 8010,
    projectId: 2,
    trades: [Trade.DEMOLITION],
    title: '철거',
    startOffset: -2,
    endOffset: 0,
    status: TaskStatus.ASSIGNED,
    progress: TaskProgress.IN_PROGRESS,
    workerId: 21,
  },
  {
    id: 8011,
    projectId: 2,
    trades: [Trade.TILING],
    title: '타일 시공',
    startOffset: 1,
    endOffset: 4,
    status: TaskStatus.OFFERED,
    progress: TaskProgress.TODO,
    activeOffer: 22,
  },
  {
    id: 8012,
    projectId: 3,
    trades: [Trade.ELECTRICAL],
    title: '전기 배선',
    startOffset: 2,
    endOffset: 5,
    status: TaskStatus.NONE,
    progress: TaskProgress.TODO,
  },
  {
    id: 8013,
    projectId: 3,
    trades: [Trade.WALLPAPER],
    title: '도배',
    startOffset: 6,
    endOffset: 8,
    status: TaskStatus.ASSIGNED,
    progress: TaskProgress.TODO,
    workerId: 23,
  },
]

// 프로젝트 작업 응답은 CompanyTask 형태로 구성한다.
function buildSeedTasks(): CompanyTask[] {
  const stamp = nowStamp()
  return TASK_SEEDS.map((seed) => {
    const project = PROJECT_SEEDS.find((p) => p.id === seed.projectId)
    return {
      id: seed.id,
      status: seed.status,
      progress: seed.progress,
      trades: seed.trades,
      start: isoDaysFromToday(seed.startOffset),
      end: isoDaysFromToday(seed.endOffset),
      workerId: seed.workerId ?? null,
      projectId: seed.projectId,
      title: seed.title,
      requirement: seed.requirement ?? '요청사항 (Mocked)',
      memo: seed.memo ?? '메모 (Mocked)',
      address: project?.address ?? null,
      createdAt: stamp,
      modifiedAt: stamp,
    }
  })
}

function offerOf(
  id: number,
  taskId: number,
  memberId: number,
  seq: number,
  status: Offer['status']
): Offer {
  const person = PEOPLE[memberId]
  const stamp = nowStamp()
  return {
    id,
    taskId,
    seq,
    status,
    member: {
      id: memberId,
      username: `worker_${memberId}`,
      name: person?.name ?? `기술자 ${memberId} (Mocked)`,
      picture: null,
    },
    profile: {
      role: ProfileRole.SKILLED,
      primaryTrade: person?.trade ?? Trade.TILING,
      experience: 3,
      headline: null,
      address: addressOf(
        person?.region ?? '서울',
        CITY_OF_REGION[person?.region ?? '서울'] ?? '중구'
      ),
    },
    createdAt: stamp,
    modifiedAt: stamp,
  }
}

function buildSeedOffers(): Offer[] {
  const out: Offer[] = []
  let id = 8500
  for (const seed of TASK_SEEDS) {
    let seq = 1
    if (seed.activeOffer != null)
      out.push(offerOf(id++, seed.id, seed.activeOffer, seq++, OfferStatus.ACTIVE))
    for (const memberId of seed.pendingOffers ?? []) {
      out.push(offerOf(id++, seed.id, memberId, seq++, OfferStatus.PENDING))
    }
  }
  return out
}

const projects: Project[] = PROJECT_SEEDS
let tasks: CompanyTask[] = buildSeedTasks()
let offers: Offer[] = buildSeedOffers()
let nextTaskId = 8100
let nextOfferId = 8600

const taskOffers = (taskId: number) => offers.filter((o) => o.taskId === taskId)

function promoteNext(taskId: number) {
  const list = taskOffers(taskId)
  if (list.some((o) => o.status === OfferStatus.ACTIVE)) return
  const next = list
    .filter((o) => o.status === OfferStatus.PENDING)
    .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))[0]
  if (next) next.status = OfferStatus.ACTIVE
}

export const scheduleOverrides = [
  getGetProjectsMockHandler((): Project[] => projects),

  // 없는 프로젝트도 실제 BE처럼 C005/404로 내려 QA 흐름을 가리지 않는다.
  http.get('*/api/v1/projects/:id', ({ params }) => {
    const project = projects.find((p) => p.id === Number(params.id))
    if (!project) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'C005', message: '요청한 리소스를 찾을 수 없습니다.' },
        },
        { status: 404 }
      )
    }
    return HttpResponse.json(project)
  }),

  getGetProjectTasksMockHandler((info): CompanyTask[] =>
    tasks.filter((t) => t.projectId === Number(info.params.id))
  ),

  getCreateTaskCompanyMockHandler(async (info): Promise<number> => {
    const body = (await info.request.json()) as CreateProjectTaskRequest
    const id = nextTaskId++
    const stamp = nowStamp()
    tasks.push({
      id,
      status: TaskStatus.NONE,
      progress: TaskProgress.TODO,
      trades: body.trades,
      start: body.start,
      end: body.end,
      workerId: null,
      projectId: body.projectId,
      title: body.title,
      requirement: body.requirement ?? null,
      memo: body.memo ?? null,
      address: projects.find((p) => p.id === body.projectId)?.address ?? null,
      createdAt: stamp,
      modifiedAt: stamp,
    })
    return id
  }),

  getUpdateTaskCompanyMockHandler(async (info) => {
    const id = Number(info.params.id)
    const body = (await info.request.json()) as UpdateProjectTaskRequest
    tasks = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            trades: body.trades,
            start: body.start,
            end: body.end,
            title: body.title,
            progress: body.progress,
            requirement: body.requirement ?? null,
            memo: body.memo ?? null,
            modifiedAt: nowStamp(),
          }
        : t
    )
    return null
  }),

  http.delete('*/api/v1/tasks/:id', ({ params }) => {
    const id = Number(params.id)
    if (!tasks.some((t) => t.id === id)) return undefined
    tasks = tasks.filter((t) => t.id !== id)
    offers = offers.filter((o) => o.taskId !== id)
    return new HttpResponse(null, { status: 200 })
  }),

  getGetTaskOffersMockHandler((info): Offer[] =>
    taskOffers(Number(info.params.id))
      .filter((o) => o.status === OfferStatus.ACTIVE || o.status === OfferStatus.PENDING)
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
  ),

  getCreateOfferMockHandler(async (info): Promise<number> => {
    const body = (await info.request.json()) as CreateOfferRequest
    const list = taskOffers(body.taskId)
    const maxSeq = Math.max(0, ...list.map((o) => o.seq ?? 0))
    const id = nextOfferId++
    offers.push(offerOf(id, body.taskId, body.workerId, maxSeq + 1, OfferStatus.PENDING))
    promoteNext(body.taskId)
    return id
  }),

  getCancelOfferMockHandler((info) => {
    const id = Number(info.params.id)
    const offer = offers.find((o) => o.id === id)
    if (offer) {
      offer.status = OfferStatus.CANCELED
      promoteNext(offer.taskId!)
    }
    return null
  }),

  http.put('*/api/v1/offers/reorder', async ({ request }) => {
    const body = (await request.json()) as ReorderOfferRequest
    const first = offers.find((o) => o.id === body.offerIds[0])
    if (!first) return HttpResponse.json(INVALID_REORDER, { status: 400 })
    const list = taskOffers(first.taskId!)
    const pendingIds = new Set(
      list.filter((o) => o.status === OfferStatus.PENDING).flatMap((o) => o.id ?? [])
    )
    const requested = new Set(body.offerIds)
    if (pendingIds.size !== requested.size || [...pendingIds].some((v) => !requested.has(v)))
      return HttpResponse.json(INVALID_REORDER, { status: 400 })
    const activeMax = Math.max(
      0,
      ...list.filter((o) => o.status === OfferStatus.ACTIVE).map((o) => o.seq ?? 0)
    )
    body.offerIds.forEach((offerId, i) => {
      const offer = offers.find((o) => o.id === offerId)
      if (offer) offer.seq = activeMax + 1 + i
    })
    return new HttpResponse(null, { status: 200 })
  }),
]

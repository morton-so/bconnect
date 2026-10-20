import { parseAsArrayOf, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { REGION_LIST, Trade, WORKER_ROLE, type Region, type WorkerRole } from '@bconnect/api-client'
import type { ExperienceLevel } from '@/lib/experience'
import { EXPERIENCE_RANGES, EXPERIENCE_VALUES } from '@/lib/experience'

const TRADE_VALUES = Object.values(Trade)
const REGION_VALUES = REGION_LIST.map((r) => r.value)

const filterParsers = {
  // 공종·직급·지역은 다중 선택 — ?trade=TILING,WALLPAPER 형태로 직렬화
  trade: parseAsArrayOf(parseAsStringLiteral(TRADE_VALUES)),
  role: parseAsArrayOf(parseAsStringLiteral(WORKER_ROLE)),
  region: parseAsArrayOf(parseAsStringLiteral(REGION_VALUES)),
  // 경력은 구간 버킷이라 단일 선택 유지
  exp: parseAsStringLiteral(EXPERIENCE_VALUES),
}

export function useFilterParams() {
  const [params, setParams] = useQueryStates(filterParsers)

  const { trade, exp: experience, role, region } = params

  const expRange = experience ? EXPERIENCE_RANGES[experience as ExperienceLevel] : undefined

  const trades = (trade ?? []) as Trade[]
  const roles = (role ?? []) as WorkerRole[]
  const regions = (region ?? []) as Region[]

  const setExperience = (value: ExperienceLevel | null) => setParams({ exp: value })

  // 빈 배열은 null 로 정규화 — 빈 파라미터가 URL 에 남지 않게 한다
  const setTrade = (value: Trade[] | null) =>
    setParams({ trade: value && value.length > 0 ? value : null })
  const setRole = (value: WorkerRole[] | null) =>
    setParams({ role: value && value.length > 0 ? value : null })
  const setRegion = (value: Region[] | null) =>
    setParams({ region: value && value.length > 0 ? value : null })

  // 선택돼 있으면 제거, 없으면 추가
  const toggleTrade = (value: Trade) =>
    setTrade(trades.includes(value) ? trades.filter((t) => t !== value) : [...trades, value])
  const toggleRole = (value: WorkerRole) =>
    setRole(roles.includes(value) ? roles.filter((r) => r !== value) : [...roles, value])
  const toggleRegion = (value: Region) =>
    setRegion(regions.includes(value) ? regions.filter((r) => r !== value) : [...regions, value])

  const clearFilter = () => setParams({ trade: null, exp: null, role: null, region: null })

  return {
    trades,
    experience: experience as ExperienceLevel | null,
    roles,
    regions,
    expRange,
    setTrade,
    setExperience,
    setRole,
    setRegion,
    toggleTrade,
    toggleRole,
    toggleRegion,
    clearFilter,
  }
}

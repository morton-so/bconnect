import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import {
  ApiError,
  createOneClick,
  createOneClickValidation,
  type License,
  type OneClick,
  type TaxpayerStatus,
  type Verdict,
} from '@bconnect/api-client'
import { formatRegistrationNumber } from '@bconnect/config/brn'

import type { CheckCategory, CheckItem, CheckItemId, CompanyInfo, StatusType } from './types'
import type { VerifyOwnerResult } from './types'

const CACHE_TTL = 3600

// 영속 캐시 (unstable_cache) — 요청 간 공유
const cachedOneClick = unstable_cache((brn: string) => createOneClick({ brn }), ['one-click'], {
  revalidate: CACHE_TTL,
})

// 요청 내 dedup (React cache) — 10개 항목이 동시 호출해도 실제 API 는 1번만 실행
const getOneClick = cache(cachedOneClick)

// 표시 헬퍼────────────────────────────────

const STATUS_TYPE: Record<Verdict, StatusType> = {
  CONFIRMED: 'positive',
  WARNING: 'negative',
  UNKNOWN: 'neutral',
  ERROR: 'error',
}

const TAXPAYER_STATUS: Record<TaxpayerStatus, string> = {
  CONTINUING: '정상 운영',
  SUSPENDED: '휴업',
  CLOSED: '폐업',
  UNKNOWN: '상태 확인 불가',
}

function text(value: string | null): string {
  return value || '-'
}

// YYYY-MM-DD → YYYY.MM.DD
function formatDate(value: string | null): string {
  if (!value) return '-'
  return value.slice(0, 10).replace(/-/g, '.')
}

function formatWon(value: number | null): string {
  return value == null ? '-' : `${value.toLocaleString()}원`
}

// UNKNOWN 은 조회 키(상호) 미확보 또는 일치 없음
function countStatus(verdict: Verdict, count: number, emptyLabel: string): string {
  if (verdict === 'UNKNOWN') return '미확인'
  return count > 0 ? `${count}건 확인` : emptyLabel
}

function errorItem(
  id: CheckItemId,
  category: CheckCategory,
  label: string,
  source: string
): CheckItem {
  return {
    id,
    category,
    label,
    source,
    status: '조회 실패',
    statusType: 'error',
    description: `${source} 조회에 실패했습니다. 잠시 후 다시 시도해주세요.`,
    details: [],
  }
}

// 항목별 매핑──────────────────────────────

function businessStatusItem(result: OneClick, registrationNumber: string): CheckItem {
  const { businessStatus } = result

  return {
    id: 'BUSINESS_STATUS',
    category: 'BUSINESS_LICENSE',
    label: '사업자 상태',
    source: '국세청',
    status: TAXPAYER_STATUS[businessStatus.taxpayerStatus],
    statusType: STATUS_TYPE[businessStatus.verdict],
    description: '국세청 기준 현재 영업 상태를 확인해요.',
    details: [
      { key: '사업자등록번호', value: formatRegistrationNumber(registrationNumber) },
      { key: '납세자상태', value: TAXPAYER_STATUS[businessStatus.taxpayerStatus] },
      ...(businessStatus.closedAt
        ? [{ key: '폐업일', value: formatDate(businessStatus.closedAt) }]
        : []),
    ],
  }
}

function insuranceItem(result: OneClick): CheckItem {
  const { insurance } = result
  const present = insurance.verdict === 'CONFIRMED'

  return {
    id: 'EMPLOYMENT_INSURANCE',
    category: 'INSURANCE',
    label: '고용/산재보험 현황',
    source: '근로복지공단',
    status: present ? '확인' : '미확인',
    statusType: STATUS_TYPE[insurance.verdict],
    description: '근로복지공단에 등록된 보험 가입 현황이에요.',
    details: present
      ? [
          { key: '사업장명', value: text(insurance.companyName) },
          { key: '업종', value: text(insurance.industry) },
          {
            key: '상시근로자수',
            value: insurance.workerCount ? `${insurance.workerCount}명` : '-',
          },
          { key: '성립일자', value: formatDate(insurance.establishedAt) },
        ]
      : [],
  }
}

function licenseItem(
  id: 'CONSTRUCTION_LICENSE' | 'SPECIALTY_LICENSE',
  label: string,
  license: License
): CheckItem {
  const status =
    license.verdict === 'UNKNOWN'
      ? '미확인'
      : license.dispositionCount > 0
        ? `등록 ${license.count}건 / 행정처분 ${license.dispositionCount}건`
        : `${license.count}건 확인`

  return {
    id,
    category: 'BUSINESS_LICENSE',
    label,
    source: '국토교통부',
    status,
    statusType: STATUS_TYPE[license.verdict],
    description: `국토교통부 KISCON 기준 ${label} 등록 및 행정처분 현황이에요.`,
    details:
      license.count > 0
        ? [
            { key: '등록업종', value: license.tradeNames.join(', ') || '-' },
            { key: '등록일', value: formatDate(license.registeredAt) },
            ...(license.dispositionCount > 0
              ? [{ key: '행정처분', value: `${license.dispositionCount}건` }]
              : []),
          ]
        : [],
  }
}

function electricalLicenseItem(result: OneClick): CheckItem {
  const { electricalLicense } = result

  return {
    id: 'ELECTRICAL_LICENSE',
    category: 'BUSINESS_LICENSE',
    label: '전기공사업 면허',
    source: '한국전기공사협회',
    status: countStatus(electricalLicense.verdict, electricalLicense.count, '미확인'),
    statusType: STATUS_TYPE[electricalLicense.verdict],
    description: '한국전기공사협회 기준 전기공사업 면허 등록 현황이에요.',
    details:
      electricalLicense.count > 0
        ? [
            { key: '상호', value: text(electricalLicense.companyName) },
            { key: '등록번호', value: text(electricalLicense.registrationNo) },
            { key: '대표자', value: text(electricalLicense.representative) },
          ]
        : [],
  }
}

function fireLicenseItem(result: OneClick): CheckItem {
  const { fireLicense } = result

  return {
    id: 'FIRE_LICENSE',
    category: 'BUSINESS_LICENSE',
    label: '소방시설업 면허',
    source: '소방청',
    status: countStatus(fireLicense.verdict, fireLicense.count, '미확인'),
    statusType: STATUS_TYPE[fireLicense.verdict],
    description: '소방청 기준 소방시설업 면허 등록 현황이에요.',
    details:
      fireLicense.count > 0
        ? [
            { key: '업체명', value: text(fireLicense.companyName) },
            { key: '대표자', value: text(fireLicense.ceoName) },
            { key: '업종', value: text(fireLicense.businessType) },
            { key: '분야', value: text(fireLicense.licenseDiv) },
          ]
        : [],
  }
}

function wageDefaultItem(result: OneClick): CheckItem {
  const { wageDefault } = result

  return {
    id: 'WAGE_ARREARS',
    category: 'WAGE_RESTRICTION',
    label: '임금체불 이력',
    source: '고용노동부',
    status: countStatus(wageDefault.verdict, wageDefault.count, '해당 없음'),
    statusType: STATUS_TYPE[wageDefault.verdict],
    description: '고용노동부 공표 체불사업주 명단이에요.',
    details:
      wageDefault.count > 0
        ? [
            { key: '사업장명', value: text(wageDefault.companyName) },
            { key: '대표자', value: text(wageDefault.name) },
            { key: '체불액', value: formatWon(wageDefault.arrearsAmount) },
          ]
        : [],
  }
}

function habitualArrearsItem(result: OneClick): CheckItem {
  const { habitualArrears } = result

  return {
    id: 'HABITUAL_ARREARS',
    category: 'WAGE_RESTRICTION',
    label: '상습체불 이력',
    source: '국토교통부',
    status: countStatus(habitualArrears.verdict, habitualArrears.count, '해당 없음'),
    statusType: STATUS_TYPE[habitualArrears.verdict],
    description: '국토교통부 공표 상습체불 명단이에요.',
    details:
      habitualArrears.count > 0
        ? [
            { key: '업체명', value: text(habitualArrears.companyName) },
            { key: '대표자', value: text(habitualArrears.representative) },
            { key: '체불금액', value: formatWon(habitualArrears.arrearsAmount) },
            { key: '공표기간', value: text(habitualArrears.publicationPeriod) },
          ]
        : [],
  }
}

function subcontractRestrictionItem(result: OneClick): CheckItem {
  const { subcontractRestriction } = result

  return {
    id: 'SUBCONTRACT_RESTRICTION',
    category: 'WAGE_RESTRICTION',
    label: '하도급 참여제한',
    source: '국토교통부',
    status: countStatus(subcontractRestriction.verdict, subcontractRestriction.count, '해당 없음'),
    statusType: STATUS_TYPE[subcontractRestriction.verdict],
    description: '국토교통부 공표 하도급법 위반 제재 명단을 확인해요.',
    details:
      subcontractRestriction.count > 0
        ? [
            { key: '상호명', value: text(subcontractRestriction.companyName) },
            { key: '대표자', value: text(subcontractRestriction.representative) },
            { key: '위반법령', value: text(subcontractRestriction.violationType) },
            {
              key: '제한기간',
              value: `${formatDate(subcontractRestriction.restrictionStart)} ~ ${formatDate(subcontractRestriction.restrictionEnd)}`,
            },
          ]
        : [],
  }
}

function retirementFundItem(result: OneClick): CheckItem {
  const { retirementFund } = result

  return {
    id: 'RETIREMENT_FUND',
    category: 'INSURANCE',
    label: '퇴직공제 가입 공사 이력',
    source: '건설근로자공제회',
    status: countStatus(retirementFund.verdict, retirementFund.count, '미확인'),
    statusType: STATUS_TYPE[retirementFund.verdict],
    description: '건설근로자공제회 퇴직공제 의무가입 공사 참여 이력이에요.',
    details:
      retirementFund.count > 0
        ? [
            { key: '최근 공사', value: text(retirementFund.projectName) },
            { key: '공사금액', value: formatWon(retirementFund.totalAmount) },
            {
              key: '공사기간',
              value: `${formatDate(retirementFund.startDate)} ~ ${formatDate(retirementFund.endDate)}`,
            },
            { key: '발주처', value: text(retirementFund.clientOrg) },
          ]
        : [],
  }
}

const ITEM_META: Record<CheckItemId, { category: CheckCategory; label: string; source: string }> = {
  BUSINESS_STATUS: { category: 'BUSINESS_LICENSE', label: '사업자 상태', source: '국세청' },
  CONSTRUCTION_LICENSE: {
    category: 'BUSINESS_LICENSE',
    label: '종합건설업 면허',
    source: '국토교통부',
  },
  SPECIALTY_LICENSE: {
    category: 'BUSINESS_LICENSE',
    label: '전문건설업 면허',
    source: '국토교통부',
  },
  ELECTRICAL_LICENSE: {
    category: 'BUSINESS_LICENSE',
    label: '전기공사업 면허',
    source: '한국전기공사협회',
  },
  FIRE_LICENSE: { category: 'BUSINESS_LICENSE', label: '소방시설업 면허', source: '소방청' },
  WAGE_ARREARS: { category: 'WAGE_RESTRICTION', label: '임금체불 이력', source: '고용노동부' },
  HABITUAL_ARREARS: { category: 'WAGE_RESTRICTION', label: '상습체불 이력', source: '국토교통부' },
  SUBCONTRACT_RESTRICTION: {
    category: 'WAGE_RESTRICTION',
    label: '하도급 참여제한',
    source: '국토교통부',
  },
  RETIREMENT_FUND: {
    category: 'INSURANCE',
    label: '퇴직공제 가입 공사 이력',
    source: '건설근로자공제회',
  },
  EMPLOYMENT_INSURANCE: {
    category: 'INSURANCE',
    label: '고용/산재보험 현황',
    source: '근로복지공단',
  },
}

function toCheckItem(id: CheckItemId, result: OneClick, registrationNumber: string): CheckItem {
  switch (id) {
    case 'BUSINESS_STATUS':
      return businessStatusItem(result, registrationNumber)
    case 'EMPLOYMENT_INSURANCE':
      return insuranceItem(result)
    case 'CONSTRUCTION_LICENSE':
      return licenseItem('CONSTRUCTION_LICENSE', '종합건설업 면허', result.generalLicense)
    case 'SPECIALTY_LICENSE':
      return licenseItem('SPECIALTY_LICENSE', '전문건설업 면허', result.specialtyLicense)
    case 'ELECTRICAL_LICENSE':
      return electricalLicenseItem(result)
    case 'FIRE_LICENSE':
      return fireLicenseItem(result)
    case 'WAGE_ARREARS':
      return wageDefaultItem(result)
    case 'HABITUAL_ARREARS':
      return habitualArrearsItem(result)
    case 'SUBCONTRACT_RESTRICTION':
      return subcontractRestrictionItem(result)
    case 'RETIREMENT_FUND':
      return retirementFundItem(result)
  }
}

// 공개 API─────────────────────────────────

/**
 * 개별 CheckItem 조회 (per-item Suspense 스트리밍용)
 * - React cache()로 같은 요청 내 dedup (SummarySection + DetailSection 동시 호출 시)
 * - 원클릭 조회 API 호출은 unstable_cache로 영속 캐시
 */
export const fetchCheckItemById = cache(
  async (id: CheckItemId, registrationNumber: string): Promise<CheckItem> => {
    const meta = ITEM_META[id]
    try {
      const result = await getOneClick(registrationNumber)
      const item = toCheckItem(id, result, registrationNumber)
      // 소스별 조회 실패는 verdict ERROR 로 내려온다
      return item.statusType === 'error'
        ? errorItem(id, meta.category, meta.label, meta.source)
        : item
    } catch (e) {
      Sentry.captureException(e, { tags: { source: 'one-click' }, extra: { registrationNumber } })
      console.error('one-click lookup failed:', e)
      return errorItem(id, meta.category, meta.label, meta.source)
    }
  }
)

/**
 * 회사 정보 조회 (CompanyHeader용)
 * 고용·산재보험 응답의 사업장명을 사용
 */
export const getCompanyInfo = cache(async (registrationNumber: string): Promise<CompanyInfo> => {
  try {
    const result = await getOneClick(registrationNumber)
    return {
      name: result.insurance.companyName ?? '-',
      registrationNumber: formatRegistrationNumber(registrationNumber),
    }
  } catch {
    return {
      name: '-',
      registrationNumber: formatRegistrationNumber(registrationNumber),
    }
  }
})

/**
 * 사업자 진위확인
 * 캐시 없음 — 매번 다른 입력(대표자명, 개업일자)이므로
 */
export async function fetchOwnerVerification(
  registrationNumber: string,
  ownerName: string,
  openDate: string
): Promise<VerifyOwnerResult> {
  try {
    await createOneClickValidation({ brn: registrationNumber, ownerName, openedAt: openDate })
    return { valid: true, message: '사업자등록번호와 대표자명, 개업일자가 일치합니다.' }
  } catch (error) {
    if (error instanceof ApiError) {
      return { valid: false, message: error.message }
    }
    Sentry.captureException(error, { tags: { source: 'one-click-validation' } })
    console.error('one-click validation failed:', error)
    return { valid: false, message: '진위확인에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }
}

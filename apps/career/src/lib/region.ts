export { REGION_LABELS } from '@bconnect/api-client'

export const REGIONS = [
  '서울',
  '부산',
  '대구',
  '인천',
  '전남광주통합특별시',
  '대전',
  '울산',
  '세종특별자치시',
  '경기',
  '충북',
  '충남',
  '전북특별자치도',
  '경북',
  '경남',
  '강원특별자치도',
  '제주특별자치도',
] as const

export type Region = (typeof REGIONS)[number]

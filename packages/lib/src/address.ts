import { regionOfState } from '@bconnect/api-client'
import type { Address, Region } from '@bconnect/api-client'
import { Address as AddressSchema } from '@bconnect/api-client/zod'
import { z } from 'zod'
import { UnknownSidoError } from './errors'

/** 카카오 우편번호 결과 중 필요한 값 */
export interface KakaoAddressResult {
  zonecode: string
  bcode: string
  roadAddress: string
  jibunAddress: string
  userSelectedType: 'R' | 'J'
  sido: string
  sigungu: string
}

/** 입력 중인 주소 */
export type AddressDraft = Omit<Address, 'state'> & { state?: Region }

/** 입력 폼 초기값 */
export function emptyAddressDraft(): AddressDraft {
  return {
    zipcode: '',
    bcode: '',
    street: '',
    state: undefined,
    city: '',
    detail: undefined,
    latitude: 0,
    longitude: 0,
  }
}

/** 완전한 주소인지 확인 및 타입 캐스팅 */
export function isCompleteAddress(a: AddressDraft | null | undefined): a is Address {
  return a != null && a.state != null && a.city.length > 0 && a.street.length > 0
}

/** 주소 zod 필드 */
export const addressField = (label = '주소') =>
  z
    .custom<AddressDraft>()
    .nullish()
    .refine(
      (a) => AddressSchema.safeParse(a && { ...a, detail: a.detail ?? undefined }).success,
      `${label}를 입력해주세요.`
    )

/** 카카오 주소 검색 결과를 Address 타입으로 변환 */
export function mapKakaoAddress(r: KakaoAddressResult): Address {
  // TODO: 위경도는 placeholder 0. 후속 BE-side geocoding(카카오 Local REST)으로 대체.
  const state = regionOfState(r.sido)
  if (state === undefined) {
    throw new UnknownSidoError(r.sido)
  }
  return {
    zipcode: r.zonecode,
    bcode: r.bcode,
    street: r.userSelectedType === 'R' ? r.roadAddress : r.jibunAddress,
    state,
    city: r.sigungu,
    detail: undefined,
    latitude: 0,
    longitude: 0,
  }
}

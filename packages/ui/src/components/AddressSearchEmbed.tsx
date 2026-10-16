/**
 * @figma-todo 주소 검색 임베드 디자인 미정
 */
'use client'

import KakaoPostcodeEmbed from 'react-daum-postcode'
import type { ComponentProps } from 'react'

export type AddressSearchResult = Parameters<
  NonNullable<ComponentProps<typeof KakaoPostcodeEmbed>['onComplete']>
>[0]

export function AddressSearchEmbed({
  onComplete,
}: {
  onComplete: (data: AddressSearchResult) => void
}) {
  return (
    <KakaoPostcodeEmbed
      onComplete={onComplete}
      autoClose={false}
      shorthand={true}
      style={{ width: '100%', height: 480 }}
    />
  )
}

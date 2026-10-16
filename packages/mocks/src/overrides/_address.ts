import type { Address, Region } from '@bconnect/api-client'

export function addressOf(
  state: Region,
  city: string,
  street = '',
  detail?: string,
  zipcode = '00000',
  bcode = '0000000000'
): Address {
  return {
    zipcode,
    bcode,
    state,
    city,
    street,
    detail,
    latitude: 0,
    longitude: 0,
  }
}

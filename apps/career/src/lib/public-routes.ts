// PUBLIC route — middleware 는 실행되지만 인증 가드만 우회. matcher 의 제외 대상과 위계가 다름.
const PUBLIC_EXACT = ['/']
const PUBLIC_PREFIX = ['/login', '/signup', '/monitoring']

/** /profile/123 및 그 하위(/coworkers·/recommendations 등) 타인 프로필은 public, /profile (내 프로필)과 /profile/edit는 보호 */
const PUBLIC_PROFILE_PATTERN = /^\/profile\/\d+(\/.*)?$/

export const isPublicPath = (pathname: string) =>
  PUBLIC_EXACT.includes(pathname) ||
  PUBLIC_PREFIX.some((path) => pathname.startsWith(path)) ||
  PUBLIC_PROFILE_PATTERN.test(pathname)

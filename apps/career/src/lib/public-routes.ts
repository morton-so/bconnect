// 미들웨어에서 인증 가드 우회
const PUBLIC_EXACT = ['/']
const PUBLIC_PREFIX = ['/login', '/signup', '/monitoring']
const PUBLIC_PROFILE_PATTERN = /^\/profile\/\d+(\/.*)?$/

export const isPublicPath = (pathname: string) =>
  PUBLIC_EXACT.includes(pathname) ||
  PUBLIC_PREFIX.some((path) => pathname.startsWith(path)) ||
  PUBLIC_PROFILE_PATTERN.test(pathname)

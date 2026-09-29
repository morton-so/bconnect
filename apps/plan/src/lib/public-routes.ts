// PUBLIC route — middleware 는 실행되지만 인증 가드만 우회. matcher 의 제외 대상과 위계가 다름.
const PUBLIC_EXACT = ['/']
const PUBLIC_PREFIX = ['/login', '/signup', '/monitoring']

export const isPublicPath = (pathname: string) =>
  PUBLIC_EXACT.includes(pathname) || PUBLIC_PREFIX.some((path) => pathname.startsWith(path))

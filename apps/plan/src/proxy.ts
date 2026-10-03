import { AUTH_HINT_COOKIE } from '@bconnect/api-client/auth-hint'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicPath } from '@/lib/public-routes'

export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl

  if (isPublicPath(pathname) && !searchParams.has('panel')) {
    return NextResponse.next()
  }

  const authHint = request.cookies.get(AUTH_HINT_COOKIE)
  if (!authHint) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// 정적파일 · API 미들웨어 생략
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'],
}

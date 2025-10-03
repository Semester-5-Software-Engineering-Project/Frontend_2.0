import { userType } from './contexts/AuthContext'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define role-based access control for routes
const TUTOR_ONLY_PATHS: RegExp[] = [
  /^\/dashboard\/upload(?:\/.*)?$/,
  /^\/dashboard\/schedule(?:\/.*)?$/,
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read role cookie set by the app (fallback to empty)
  const role = request.cookies.get('role')?.value || ''

  // Block student from tutor-only paths
  if (role === userType.STUDENT && TUTOR_ONLY_PATHS.some((rx) => rx.test(pathname))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.searchParams.set('forbidden', '1')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}



import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isTokenValid(token: string): boolean {
  try {
    if (!token) return false
    
    // Décoder le payload JWT
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    // Vérifier l'expiration du token
    return payload.exp > now
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value
  const isAuthenticated = accessToken && isTokenValid(accessToken)
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isRootPage = request.nextUrl.pathname === '/'

  if (!isAuthenticated && !isLoginPage && !isRootPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
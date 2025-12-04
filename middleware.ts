import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function middleware(request: NextRequest) {
  // Ochrana admin panelu
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('admin_session')

    if (sessionCookie) {
      try {
        // Verify JWT token
        await jwtVerify(
          sessionCookie.value,
          new TextEncoder().encode(JWT_SECRET)
        )
        return NextResponse.next()
      } catch (error) {
        // Invalid token, redirect to login
        console.error('Invalid session token:', error)
      }
    }

    // No valid session, redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}

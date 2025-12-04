import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Run on Edge Runtime for faster response times globally
export const config = {
  matcher: '/admin/:path*',
  runtime: 'edge',
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Admin routes should only be accessible on admin.monlii.cz
  if (pathname.startsWith('/admin')) {
    const isAdminDomain = hostname.startsWith('admin.') || hostname === 'localhost:3000'
    
    // If accessing /admin on main domain, redirect to admin subdomain
    if (!isAdminDomain) {
      const adminUrl = new URL(request.url)
      adminUrl.host = hostname.replace(/^(www\.)?/, 'admin.')
      return NextResponse.redirect(adminUrl)
    }

    // Allow access to login page
    if (pathname === '/admin/login') {
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

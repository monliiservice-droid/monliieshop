import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const LOGIN_ATTEMPTS_LIMIT = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minut

// Porovnání v konstantním čase (hash srovná délky, aby timingSafeEqual nepadal)
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest()
  const hashB = createHash('sha256').update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

async function verifyPassword(password: string): Promise<boolean> {
  // Preferujeme bcrypt hash (ADMIN_PASSWORD_HASH), plaintext ADMIN_PASSWORD je fallback
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  if (passwordHash) {
    return bcrypt.compare(password, passwordHash)
  }
  const validPassword = process.env.ADMIN_PASSWORD
  return !!validPassword && safeEqual(password, validPassword)
}

export async function POST(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(
    `login:${getClientIp(request)}`,
    LOGIN_ATTEMPTS_LIMIT,
    LOGIN_WINDOW_MS
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Příliš mnoho pokusů o přihlášení. Zkuste to prosím později.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  try {
    const body = await request.json()
    const username = typeof body?.username === 'string' ? body.username : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    // Get credentials from environment variables
    const validUsername = process.env.ADMIN_USERNAME || 'admin'

    if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { message: 'Admin credentials not configured' },
        { status: 500 }
      )
    }

    // Obě kontroly vždy proběhnou, aby odezva neprozrazovala platné jméno
    const usernameOk = safeEqual(username, validUsername)
    const passwordOk = await verifyPassword(password)

    if (usernameOk && passwordOk) {
      // Create JWT token
      const token = await new SignJWT({ username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .setIssuedAt()
        .sign(new TextEncoder().encode(JWT_SECRET))

      // Set cookie
      const cookieStore = await cookies()
      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    )
  }
}

import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Verify admin authentication from cookies
 * Returns the decoded token payload if valid, null otherwise
 */
export async function verifyAdminAuth(): Promise<{ username: string } | null> {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured')
    return null
  }

  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')

    if (!sessionCookie) {
      return null
    }

    const { payload } = await jwtVerify(
      sessionCookie.value,
      new TextEncoder().encode(JWT_SECRET)
    )

    return payload as { username: string }
  } catch (error) {
    console.error('Auth verification failed:', error)
    return null
  }
}

/**
 * Check if request is authenticated as admin
 * Use this at the start of admin API routes
 */
export async function requireAdminAuth(): Promise<boolean> {
  const auth = await verifyAdminAuth()
  return auth !== null
}

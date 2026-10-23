import type { NextRequest } from 'next/server'

/**
 * Jednoduchý in-memory rate limiter (fixed window).
 *
 * Pozor: na Vercelu běží více instancí funkcí a každá má vlastní paměť,
 * limit je tedy "best effort" – útok výrazně zpomalí, ale není absolutní.
 * Pro striktní limit je potřeba sdílené úložiště (např. Upstash Redis).
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): {
  allowed: boolean
  retryAfterSeconds: number
} {
  const now = Date.now()

  // Úklid prošlých záznamů, aby mapa nerostla donekonečna
  if (buckets.size > 10_000) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(k)
    }
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  bucket.count++
  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  }
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

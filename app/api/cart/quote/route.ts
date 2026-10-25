import { NextRequest, NextResponse } from 'next/server'
import { OrderValidationError, quoteCartItems } from '@/lib/order-pricing'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Aktuální ceny a dostupnost položek košíku (volá košík a pokladna při načtení)
export async function POST(request: NextRequest) {
  const { allowed } = rateLimit(`cart-quote:${getClientIp(request)}`, 120, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ message: 'Příliš mnoho požadavků' }, { status: 429 })

  try {
    const body = await request.json().catch(() => null)
    return NextResponse.json({ items: await quoteCartItems(body?.items) })
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error('Error quoting cart:', error)
    return NextResponse.json({ message: 'Chyba při načítání cen' }, { status: 500 })
  }
}

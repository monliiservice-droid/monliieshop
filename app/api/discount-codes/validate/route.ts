import { NextRequest, NextResponse } from 'next/server'
import { findValidDiscountCode } from '@/lib/discount'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Ochrana proti zkoušení kódů hrubou silou
  const { allowed, retryAfterSeconds } = rateLimit(`discount:${getClientIp(request)}`, 30, 10 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { valid: false, message: 'Příliš mnoho pokusů. Zkuste to prosím později.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  try {
    const { code, orderAmount } = await request.json()

    const check = await findValidDiscountCode(code, Number(orderAmount) || 0)
    if (!check.valid) {
      return NextResponse.json(
        { valid: false, message: check.message },
        { status: check.status }
      )
    }

    // Slevový kód je platný
    return NextResponse.json({
      valid: true,
      discount: {
        code: check.discountCode.code,
        type: check.discountCode.type,
        value: check.discountCode.value
      }
    })

  } catch (error) {
    console.error('Error validating discount code:', error)
    return NextResponse.json(
      { valid: false, message: 'Chyba při ověřování slevového kódu' },
      { status: 500 }
    )
  }
}

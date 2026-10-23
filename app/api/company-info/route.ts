import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Veřejné identifikační údaje prodávajícího (patička webu).
// Bankovní spojení, číslování faktur apod. zůstávají jen v admin API.
export async function GET() {
  try {
    const settings = await prisma.companySettings.findFirst({
      select: {
        companyName: true,
        ico: true,
        dic: true,
        street: true,
        city: true,
        zip: true,
        country: true,
        email: true,
        phone: true,
      }
    })

    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' }
    })
  } catch (error) {
    console.error('Error fetching company info:', error)
    return NextResponse.json(null, { status: 500 })
  }
}

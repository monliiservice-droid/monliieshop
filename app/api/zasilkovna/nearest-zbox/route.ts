import { NextRequest, NextResponse } from 'next/server'
import { findNearestZBox } from '@/lib/zasilkovna-zbox'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { street, city, zip } = body

    if (!street || !city || !zip) {
      return NextResponse.json(
        { error: 'Missing required address fields' },
        { status: 400 }
      )
    }

    const nearestZBox = await findNearestZBox({
      street,
      city,
      zip,
      country: 'Czech Republic',
    })

    if (!nearestZBox) {
      return NextResponse.json(
        { error: 'Could not find nearest Z-BOX. Please check your address.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      zbox: nearestZBox,
    })
  } catch (error) {
    console.error('Error finding nearest Z-BOX:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

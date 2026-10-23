import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Veřejný API klíč pro mapový widget Zásilkovny (API heslo zůstává tajné a zde se nepoužívá)
export async function GET() {
  return NextResponse.json(
    { apiKey: process.env.ZASILKOVNA_API_KEY || null },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
  )
}

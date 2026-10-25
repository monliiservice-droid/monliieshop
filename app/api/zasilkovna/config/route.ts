import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Veřejný API klíč pro mapový widget Zásilkovny (API heslo zůstává tajné a zde se nepoužívá)
export async function GET() {
  const apiKey = process.env.ZASILKOVNA_API_KEY?.trim() || null
  if (!apiKey) console.error('ZASILKOVNA_API_KEY není nastavený – mapa Z-BOXů se neotevře')
  return NextResponse.json(
    { apiKey },
    // Chybějící klíč se necachuje, aby mapa začala fungovat hned po jeho doplnění
    { headers: { 'Cache-Control': apiKey ? 'public, s-maxage=3600' : 'no-store' } }
  )
}

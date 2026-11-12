import { NextRequest, NextResponse } from 'next/server'
import { adminErrorResponse, revalidateStorefront, unauthorizedResponse } from '@/lib/admin-api'
import { getSeoSettings, writeSetting } from '@/lib/site-settings-server'
import { SEO_SETTINGS_KEY, mergeSeoSettings } from '@/lib/seo-settings'

export async function GET() {
  const denied = await unauthorizedResponse()
  if (denied) return denied
  return NextResponse.json(await getSeoSettings())
}

export async function PUT(request: NextRequest) {
  const denied = await unauthorizedResponse()
  if (denied) return denied
  try {
    const seo = mergeSeoSettings(await request.json())
    await writeSetting(SEO_SETTINGS_KEY, seo)
    revalidateStorefront()
    return NextResponse.json(seo)
  } catch (err) {
    return adminErrorResponse(err, 'SEO nastavení se nepodařilo uložit')
  }
}

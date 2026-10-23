import { NextRequest, NextResponse } from 'next/server'
import { revalidateStorefront, unauthorizedResponse } from '@/lib/admin-api'
import {
  PAGE_HEADERS_KEY,
  SHOP_SETTINGS_KEY,
  mergePageHeaders,
  mergeShopSettings,
} from '@/lib/site-settings'
import { getPageHeaders, getShopSettings, writeSetting } from '@/lib/site-settings-server'

export async function GET() {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const [shop, pageHeaders] = await Promise.all([getShopSettings(), getPageHeaders()])
  return NextResponse.json({ shop, pageHeaders })
}

export async function PUT(request: NextRequest) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const body = await request.json()
  if (body?.shop) {
    const shop = mergeShopSettings(body.shop)
    shop.productGridColumns = ([2, 3, 4] as const).includes(shop.productGridColumns) ? shop.productGridColumns : 4
    shop.productCardStyle = (['classic', 'minimal', 'overlay'] as const).includes(shop.productCardStyle)
      ? shop.productCardStyle
      : 'classic'
    await writeSetting(SHOP_SETTINGS_KEY, shop)
  }
  if (body?.pageHeaders) {
    await writeSetting(PAGE_HEADERS_KEY, mergePageHeaders(body.pageHeaders))
  }
  revalidateStorefront()
  return NextResponse.json({ success: true })
}

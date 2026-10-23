import { cache } from 'react'
import { prisma } from './prisma'
import {
  PAGE_HEADERS_KEY,
  SHOP_SETTINGS_KEY,
  mergePageHeaders,
  mergeShopSettings,
  type PageHeaders,
  type ShopSettings,
} from './site-settings'

async function readSetting(key: string): Promise<unknown> {
  try {
    const row = await prisma.settings.findUnique({ where: { key } })
    return row ? JSON.parse(row.value) : null
  } catch (error) {
    console.error(`Error reading setting ${key}:`, error)
    return null
  }
}

export async function writeSetting(key: string, value: unknown) {
  const json = JSON.stringify(value)
  await prisma.settings.upsert({
    where: { key },
    update: { value: json },
    create: { key, value: json },
  })
}

// cache() – v rámci jednoho požadavku se nastavení načte jen jednou
export const getShopSettings = cache(async (): Promise<ShopSettings> => {
  return mergeShopSettings(await readSetting(SHOP_SETTINGS_KEY))
})

export const getPageHeaders = cache(async (): Promise<PageHeaders> => {
  return mergePageHeaders(await readSetting(PAGE_HEADERS_KEY))
})

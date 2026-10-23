import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminErrorResponse, badRequest, revalidateStorefront, unauthorizedResponse } from '@/lib/admin-api'
import { isSectionType, normalizeSectionData } from '@/lib/sections'
import { getDefaultSections, getPageSections } from '@/lib/sections-server'

const PAGES = ['home']
const MAX_SECTIONS = 40

export async function GET(request: NextRequest) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const page = request.nextUrl.searchParams.get('page') || 'home'
  if (!PAGES.includes(page)) return badRequest('Neznámá stránka')
  if (request.nextUrl.searchParams.get('defaults') === '1') {
    return NextResponse.json(getDefaultSections())
  }
  return NextResponse.json(await getPageSections(page))
}

/** Uloží celé rozložení stránky najednou (pořadí = pořadí v poli) */
export async function PUT(request: NextRequest) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const body = await request.json()
  const page = typeof body?.page === 'string' ? body.page : 'home'
  if (!PAGES.includes(page)) return badRequest('Neznámá stránka')
  if (!Array.isArray(body?.sections) || body.sections.length > MAX_SECTIONS) {
    return badRequest('Neplatné sekce')
  }

  const sections = body.sections
    .filter((s: any) => isSectionType(s?.type))
    .map((s: any, index: number) => ({
      page,
      type: s.type,
      sortOrder: index,
      isVisible: s.isVisible !== false,
      data: normalizeSectionData(s.type, s.data) as object,
    }))

  try {
    // Jednoduché a spolehlivé: celé rozložení stránky se nahradí v jedné transakci
    await prisma.$transaction([
      prisma.pageSection.deleteMany({ where: { page } }),
      prisma.pageSection.createMany({ data: sections }),
    ])
    revalidateStorefront()
    return NextResponse.json(await prisma.pageSection.findMany({ where: { page }, orderBy: { sortOrder: 'asc' } }))
  } catch (error) {
    return adminErrorResponse(error, 'Homepage se nepodařilo uložit')
  }
}

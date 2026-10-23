import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminErrorResponse, badRequest, revalidateStorefront, unauthorizedResponse } from '@/lib/admin-api'

/** Uloží pořadí kategorií na jedné úrovni (pořadí v poli = pořadí na webu) */
export async function PUT(request: NextRequest) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const body = await request.json()
  const ids: unknown = body?.ids
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200 || ids.some((id) => typeof id !== 'string')) {
    return badRequest('Neplatné pořadí kategorií')
  }

  try {
    await prisma.$transaction(
      (ids as string[]).map((id, index) => prisma.category.update({ where: { id }, data: { sortOrder: index + 1 } }))
    )
    revalidateStorefront()
    return NextResponse.json({ success: true })
  } catch (error) {
    return adminErrorResponse(error, 'Pořadí kategorií se nepodařilo uložit')
  }
}

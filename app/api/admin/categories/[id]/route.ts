import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminErrorResponse, badRequest, isPrismaUniqueError, revalidateStorefront, unauthorizedResponse } from '@/lib/admin-api'
import { parseCategoryInput } from '@/lib/admin-inputs'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const { id } = await params
  const data = parseCategoryInput(await request.json())
  if (!data.name || !data.slug) return badRequest('Vyplňte název kategorie')

  // Kategorie nesmí být sama sobě (ani své podkategorii) nadřazená
  if (data.parentId) {
    const all = await prisma.category.findMany({ select: { id: true, parentId: true } })
    const parentOf = new Map(all.map((c) => [c.id, c.parentId]))
    let current: string | null | undefined = data.parentId
    while (current) {
      if (current === id) return badRequest('Kategorii nelze zařadit pod sebe samu ani pod svou podkategorii')
      current = parentOf.get(current)
    }
  }

  try {
    const category = await prisma.category.update({ where: { id }, data })
    revalidateStorefront()
    return NextResponse.json(category)
  } catch (error) {
    if (isPrismaUniqueError(error)) return badRequest('Kategorie s touto URL (slug) už existuje')
    return adminErrorResponse(error, 'Chyba při ukládání kategorie')
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ message: 'Kategorie nenalezena' }, { status: 404 })

  // Podkategorie i produkty se přesunou o úroveň výš, nic se nesmaže
  await prisma.$transaction([
    prisma.category.updateMany({ where: { parentId: id }, data: { parentId: category.parentId } }),
    prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: category.parentId } }),
    prisma.category.delete({ where: { id } }),
  ])
  revalidateStorefront()
  return NextResponse.json({ success: true })
}

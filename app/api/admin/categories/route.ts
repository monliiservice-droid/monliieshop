import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { badRequest, isPrismaUniqueError, revalidateStorefront, unauthorizedResponse } from '@/lib/admin-api'
import { parseCategoryInput } from '@/lib/admin-inputs'

export async function GET() {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const data = parseCategoryInput(await request.json())
  if (!data.name || !data.slug) return badRequest('Vyplňte název kategorie')

  try {
    const category = await prisma.category.create({ data })
    revalidateStorefront()
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (isPrismaUniqueError(error)) return badRequest('Kategorie s touto URL (slug) už existuje')
    console.error('Error creating category:', error)
    return NextResponse.json({ message: 'Chyba při vytváření kategorie' }, { status: 500 })
  }
}

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { adminErrorResponse, badRequest, revalidateStorefront } from '@/lib/admin-api'
import { parseProductInput, validateProduct } from '@/lib/admin-inputs'

export async function POST(request: Request) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const input = parseProductInput(await request.json())
  const error = validateProduct(input)
  if (error) return badRequest(error)

  try {
    const product = await prisma.product.create({
      data: {
        ...input.data,
        ...(input.variants && input.variants.length > 0 && { variants: { create: input.variants } }),
      },
    })
    revalidateStorefront()
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    return adminErrorResponse(err, 'Chyba při vytváření produktu')
  }
}

export async function GET() {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      include: { categoryRef: { select: { id: true, name: true } } }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

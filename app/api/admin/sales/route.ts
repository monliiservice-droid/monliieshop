import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminErrorResponse, badRequest, isPrismaUniqueError, revalidateStorefront, unauthorizedResponse } from '@/lib/admin-api'
import { parseSaleInput, validateSale } from '@/lib/admin-inputs'

export async function GET() {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const sales = await prisma.saleEvent.findMany({
    orderBy: { startsAt: 'desc' },
    include: {
      products: { select: { id: true } },
      categories: { select: { id: true } },
    },
  })
  return NextResponse.json(
    sales.map(({ products, categories, ...sale }) => ({
      ...sale,
      productIds: products.map((p) => p.id),
      categoryIds: categories.map((c) => c.id),
    }))
  )
}

export async function POST(request: NextRequest) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const input = parseSaleInput(await request.json())
  const error = validateSale(input)
  if (error) return badRequest(error)

  try {
    const sale = await prisma.saleEvent.create({
      data: {
        ...input.data,
        products: { connect: input.productIds.map((id) => ({ id })) },
        categories: { connect: input.categoryIds.map((id) => ({ id })) },
      },
    })
    revalidateStorefront()
    return NextResponse.json(sale, { status: 201 })
  } catch (err) {
    if (isPrismaUniqueError(err)) return badRequest('Výprodej s touto URL (slug) už existuje')
    return adminErrorResponse(err, 'Chyba při vytváření výprodeje')
  }
}

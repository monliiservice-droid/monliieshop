import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminErrorResponse, badRequest, isPrismaUniqueError, revalidateStorefront, unauthorizedResponse } from '@/lib/admin-api'
import { parseSaleInput, validateSale } from '@/lib/admin-inputs'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const { id } = await params
  const input = parseSaleInput(await request.json())
  const error = validateSale(input)
  if (error) return badRequest(error)

  try {
    const sale = await prisma.saleEvent.update({
      where: { id },
      data: {
        ...input.data,
        products: { set: input.productIds.map((pid) => ({ id: pid })) },
        categories: { set: input.categoryIds.map((cid) => ({ id: cid })) },
      },
    })
    revalidateStorefront()
    return NextResponse.json(sale)
  } catch (err) {
    if (isPrismaUniqueError(err)) return badRequest('Výprodej s touto URL (slug) už existuje')
    return adminErrorResponse(err, 'Chyba při ukládání výprodeje')
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const denied = await unauthorizedResponse()
  if (denied) return denied

  const { id } = await params
  await prisma.saleEvent.delete({ where: { id } }).catch(() => null)
  revalidateStorefront()
  return NextResponse.json({ success: true })
}

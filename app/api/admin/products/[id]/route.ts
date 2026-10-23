import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { adminErrorResponse, badRequest, revalidateStorefront } from '@/lib/admin-api'
import { parseProductInput, validateProduct } from '@/lib/admin-inputs'

// GET - Získat konkrétní produkt
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: { select: { size: true, color: true, stock: true } }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produkt nenalezen' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání produktu' },
      { status: 500 }
    )
  }
}

// PUT - Aktualizovat produkt
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const input = parseProductInput(await request.json())
  const error = validateProduct(input)
  if (error) return badRequest(error)
  const { data, variants } = input

  try {
    // Sklad po variantách se při uložení nahradí tím, co je ve formuláři
    const product = await prisma.$transaction(async (tx) => {
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } })
        if (variants.length > 0) {
          await tx.productVariant.createMany({ data: variants.map((v) => ({ ...v, productId: id })) })
        }
      }
      return tx.product.update({ where: { id }, data })
    })
    revalidateStorefront()
    return NextResponse.json(product)
  } catch (err) {
    return adminErrorResponse(err, 'Chyba při aktualizaci produktu')
  }
}

// DELETE - Smazat produkt
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    
    await prisma.product.delete({
      where: { id }
    })
    revalidateStorefront()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání produktu' },
      { status: 500 }
    )
  }
}

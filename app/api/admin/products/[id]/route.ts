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
        variants: true
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
  const data = parseProductInput(await request.json())
  const error = validateProduct(data)
  if (error) return badRequest(error)

  try {
    const product = await prisma.product.update({ where: { id }, data })
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

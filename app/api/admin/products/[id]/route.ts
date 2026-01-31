import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

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

  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, stock, category, images, isSet, setOptions, colors, sortOrder } = body

    // Debug: Vypsat co přišlo z frontendu
    console.log('🔧 [API] Ukládání produktu:', name)
    console.log('💰 [API] Price z frontendu:', price)
    console.log('📦 [API] IsSet:', isSet)
    if (isSet) {
      console.log('⚙️ [API] SetOptions:', setOptions)
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        category,
        images,
        isSet: isSet !== undefined ? isSet : false,
        setOptions: setOptions || '{}',
        colors: colors || '[]',
        sortOrder: sortOrder !== undefined ? sortOrder : 0,
        updatedAt: new Date()
      }
    })

    console.log('✅ [API] Produkt uložen s price:', product.price)

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci produktu' },
      { status: 500 }
    )
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání produktu' },
      { status: 500 }
    )
  }
}

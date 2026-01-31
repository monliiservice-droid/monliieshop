import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(request: Request) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, price, stock, category, images, isSet, setOptions, colors, sortOrder } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        category,
        images: images || '[]',
        isSet: isSet || false,
        setOptions: setOptions || '{}',
        colors: colors || '[]',
        sortOrder: sortOrder !== undefined ? sortOrder : 0
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
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
      ]
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

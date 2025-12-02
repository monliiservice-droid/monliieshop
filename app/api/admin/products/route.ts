import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, stock, category, images } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        category,
        images: images || '[]'
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
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
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

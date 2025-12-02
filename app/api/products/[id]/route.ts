import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

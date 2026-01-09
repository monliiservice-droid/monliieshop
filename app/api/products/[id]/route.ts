import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


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

    // Debug: Vypsat co se vrací z databáze
    console.log('📖 [GET API] Načítání produktu:', product.name)
    console.log('💰 [GET API] Price z databáze:', product.price)
    console.log('📦 [GET API] IsSet:', product.isSet)
    if (product.isSet) {
      console.log('⚙️ [GET API] SetOptions:', product.setOptions)
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

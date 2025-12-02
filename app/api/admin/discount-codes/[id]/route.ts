import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'

// PATCH - aktualizovat slevový kód (např. aktivovat/deaktivovat)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json()
    const { id } = await params

    const code = await prisma.discountCode.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(code)
  } catch (error) {
    console.error('Error updating discount code:', error)
    return NextResponse.json(
      { message: 'Chyba při aktualizaci slevového kódu' },
      { status: 500 }
    )
  }
}

// DELETE - smazat slevový kód
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.discountCode.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Slevový kód byl smazán' })
  } catch (error) {
    console.error('Error deleting discount code:', error)
    return NextResponse.json(
      { message: 'Chyba při mazání slevového kódu' },
      { status: 500 }
    )
  }
}

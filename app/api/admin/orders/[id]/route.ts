import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Smaž objednávku a všechny její položky (cascade delete)
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Objednávka byla úspěšně smazána' 
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { message: 'Chyba při mazání objednávky' },
      { status: 500 }
    )
  }
}

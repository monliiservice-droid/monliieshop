import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { RELEASED_STATUSES, releaseOrderResources } from '@/lib/order-inventory'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })
    if (!order) {
      return NextResponse.json(
        { message: 'Objednávka nenalezena' },
        { status: 404 }
      )
    }

    // Smaž objednávku a všechny její položky (cascade delete). Pokud zboží ještě
    // neodešlo a objednávka nebyla zrušena, vrátíme ho na sklad a uvolníme slevový kód.
    const returnsToStock = !RELEASED_STATUSES.includes(order.status)
      && !['shipped', 'delivered'].includes(order.status)
    await prisma.$transaction(async (tx) => {
      if (returnsToStock) {
        await releaseOrderResources(tx, order)
      }
      await tx.order.delete({
        where: { id }
      })
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

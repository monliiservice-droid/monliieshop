import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function PUT(request: Request) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productOrders } = body // Array of {id, sortOrder}

    // Update all products in a transaction
    await prisma.$transaction(
      productOrders.map((item: { id: string; sortOrder: number }) =>
        prisma.product.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering products:', error)
    return NextResponse.json(
      { error: 'Chyba při změně pořadí produktů' },
      { status: 500 }
    )
  }
}

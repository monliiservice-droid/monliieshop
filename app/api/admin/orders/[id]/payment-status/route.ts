import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { paymentStatus } = body

    // Validate payment status
    const validStatuses = ['pending', 'paid', 'failed', 'refunded']
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Neplatný stav platby' },
        { status: 400 }
      )
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Objednávka nenalezena' },
        { status: 404 }
      )
    }

    // Update payment status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // If marking as paid, also mark the invoice as paid
    if (paymentStatus === 'paid') {
      try {
        const invoice = await prisma.invoice.findFirst({
          where: { orderId: id }
        })
        if (invoice && invoice.status !== 'paid') {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { 
              status: 'paid',
              paidDate: new Date()
            }
          })
        }
      } catch (invoiceError) {
        console.error('Error updating invoice status:', invoiceError)
      }
    }

    console.log(`Payment status for order ${order.orderNumber} changed to ${paymentStatus}`)

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci stavu platby' },
      { status: 500 }
    )
  }
}

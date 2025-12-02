import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGoPayClient } from '@/lib/gopay'
import { sendOrderEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // GoPay posílá notification jako form data
    const formData = await request.formData()
    const paymentId = formData.get('id') as string

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing payment ID' },
        { status: 400 }
      )
    }

    console.log(`GoPay notification received for payment: ${paymentId}`)

    // Získáme aktuální stav platby z GoPay API
    const gopay = getGoPayClient()
    const paymentStatus = await gopay.getPaymentStatus(parseInt(paymentId))

    console.log(`GoPay payment status:`, paymentStatus)

    // Najdeme objednávku podle GoPay payment ID
    const order = await prisma.order.findFirst({
      where: {
        gopayPaymentId: paymentId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      console.error(`Order not found for GoPay payment: ${paymentId}`)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Aktualizujeme stav objednávky podle GoPay stavu
    let newPaymentStatus = order.paymentStatus
    let newStatus = order.status

    switch (paymentStatus.state) {
      case 'PAID':
      case 'AUTHORIZED':
        newPaymentStatus = 'paid'
        if (order.status === 'new') {
          newStatus = 'accepted'
        }
        break

      case 'CANCELED':
      case 'TIMEOUTED':
        newPaymentStatus = 'failed'
        newStatus = 'cancelled'
        break

      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        newPaymentStatus = 'refunded'
        break
    }

    // Aktualizujeme objednávku v databázi
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: newPaymentStatus,
        status: newStatus,
        gopayState: paymentStatus.state,
      },
    })

    console.log(`Order ${order.orderNumber} updated: ${newPaymentStatus}, ${newStatus}`)

    // Pokud byla platba úspěšná, pošleme potvrzovací email
    if (newPaymentStatus === 'paid' && order.paymentStatus !== 'paid') {
      try {
        await sendOrderEmail('order_accepted', {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          items: order.items,
          shippingAddress: JSON.parse(order.shippingAddress),
        })
        console.log(`Confirmation email sent for order ${order.orderNumber}`)
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Nepřerušujeme zpracování kvůli chybě emailu
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GoPay webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GoPay testovací endpoint (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get('id')

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
  }

  try {
    const gopay = getGoPayClient()
    const paymentStatus = await gopay.getPaymentStatus(parseInt(paymentId))

    return NextResponse.json(paymentStatus)
  } catch (error) {
    console.error('GoPay status check error:', error)
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    )
  }
}

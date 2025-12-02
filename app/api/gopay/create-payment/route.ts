import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGoPayClient } from '@/lib/gopay'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Načteme objednávku z databáze
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Vytvoříme GoPay platbu
    const gopay = getGoPayClient()
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    const payment = await gopay.createPayment({
      amount: order.totalAmount,
      currency: 'CZK',
      order_number: order.orderNumber,
      order_description: `Objednávka #${order.orderNumber} - Monlii E-shop`,
      items: order.items.map((item) => ({
        name: item.product.name,
        amount: item.price,
        count: item.quantity,
      })),
      callback: {
        return_url: `${baseUrl}/checkout/success?order=${order.orderNumber}`,
        notification_url: `${baseUrl}/api/webhooks/gopay`,
      },
      payer: {
        contact: {
          first_name: order.customerName.split(' ')[0] || '',
          last_name: order.customerName.split(' ').slice(1).join(' ') || '',
          email: order.customerEmail,
          phone_number: order.customerPhone || '',
        },
      },
      lang: 'CS',
    })

    // Uložíme GoPay payment ID do objednávky
    await prisma.order.update({
      where: { id: orderId },
      data: {
        gopayPaymentId: payment.id.toString(),
        gopayState: payment.state,
      },
    })

    console.log(`GoPay payment created: ${payment.id} for order ${order.orderNumber}`)

    // Vrátíme URL pro přesměrování na platební bránu
    return NextResponse.json({
      paymentId: payment.id,
      gatewayUrl: payment.gw_url,
    })
  } catch (error: any) {
    console.error('GoPay payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}

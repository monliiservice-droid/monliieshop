import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail } from '@/lib/email'

export const runtime = 'edge'

// Tento endpoint by měl být volán cronem každý den
// Například přes Vercel Cron Jobs nebo externí službu jako cron-job.org
export async function GET() {
  try {
    // Najdi objednávky, které byly doručeny před 7 dny a ještě nebyl odeslán review email
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const ordersToReview = await prisma.order.findMany({
      where: {
        status: 'delivered',
        deliveredAt: {
          lte: sevenDaysAgo
        },
        reviewEmailSentAt: null
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      take: 50 // Maximálně 50 emailů najednou
    })

    const results = []

    for (const order of ordersToReview) {
      try {
        const shippingAddress = JSON.parse(order.shippingAddress)
        const orderData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress,
          trackingNumber: order.trackingNumber || undefined
        }

        // Odešli review email
        await sendOrderEmail('review_request', orderData)

        // Označ, že email byl odeslán
        await prisma.order.update({
          where: { id: order.id },
          data: { reviewEmailSentAt: new Date() }
        })

        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: true
        })
      } catch (error) {
        console.error(`Failed to send review email for order ${order.orderNumber}:`, error)
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: false,
          error: String(error)
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} orders`,
      results
    })
  } catch (error) {
    console.error('Error in review emails cron:', error)
    return NextResponse.json(
      { message: 'Chyba při odesílání review emailů', error: String(error) },
      { status: 500 }
    )
  }
}

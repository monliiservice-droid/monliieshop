import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail } from '@/lib/email'

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD-${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Creating order with data:', data)

    // Validace
    if (!data.customer || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { message: 'Neplatná data objednávky' },
        { status: 400 }
      )
    }

    // Generování čísla objednávky
    const orderNumber = generateOrderNumber()

    // Vytvoření objednávky v databázi
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: `${data.customer.firstName} ${data.customer.lastName}`,
        customerEmail: data.customer.email,
        customerPhone: data.customer.phone || '',
        shippingAddress: JSON.stringify({
          firstName: data.customer.firstName,
          lastName: data.customer.lastName,
          street: data.customer.address,
          city: data.customer.city,
          zip: data.customer.zip,
          ...(data.customer.isCompany && {
            company: data.customer.company,
            ico: data.customer.ico,
            dic: data.customer.dic
          }),
          // Přidáme shipping details přímo do adresy
          shippingDetails: {
            ...(data.shipping.pickupPoint && { pickupPoint: data.shipping.pickupPoint }),
            ...(data.shipping.personalLocation && { personalLocation: data.shipping.personalLocation })
          }
        }),
        shippingMethod: data.shipping.method,
        paymentMethod: data.payment.method,
        totalAmount: data.totalPrice,
        status: 'new',
        items: {
          create: data.items.map((item: any) => ({
            productName: item.name,
            productId: item.productId || null,
            quantity: item.quantity || 1,
            price: item.price,
            variant: item.variant ? JSON.stringify(item.variant) : null
          }))
        }
      },
      include: {
        items: true
      }
    })

    console.log('Order created:', order)

    // Odeslání emailů
    try {
      // Email zákazníkovi
      await sendOrderEmail('order_received_customer', {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        items: data.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price
        })),
        shippingAddress: JSON.parse(order.shippingAddress)
      })

      // Email prodejci
      await sendOrderEmail('order_received_seller', {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        items: data.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price
        })),
        shippingAddress: JSON.parse(order.shippingAddress)
      })

      console.log('Order emails sent successfully')
    } catch (emailError) {
      console.error('Error sending order emails:', emailError)
      // Pokračujeme i když se email nepodaří odeslat
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber
      }
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { message: 'Chyba při vytváření objednávky', error: String(error) },
      { status: 500 }
    )
  }
}

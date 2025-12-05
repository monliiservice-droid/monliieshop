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
    
    console.log('Creating order with data:', JSON.stringify(data, null, 2))

    // Validace
    if (!data.customer || !data.items || data.items.length === 0) {
      console.error('Validation failed:', { hasCustomer: !!data.customer, hasItems: !!data.items, itemsLength: data.items?.length })
      return NextResponse.json(
        { message: 'Neplatná data objednávky' },
        { status: 400 }
      )
    }

    // Generování čísla objednávky
    const orderNumber = generateOrderNumber()
    console.log('Generated order number:', orderNumber)

    // Vytvoření objednávky v databázi
    console.log('Creating order in database...')
    let order
    try {
      order = await prisma.order.create({
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
          shippingMethod: data.shipping.method || 'zasilkovna_pickup',
          paymentMethod: data.payment.method || 'card',
          totalAmount: parseFloat(data.totalPrice) || 0,
          status: 'new',
          items: {
            create: data.items.map((item: any) => ({
              productName: item.name || '',
              productId: item.productId || null,
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || 0,
              variant: item.variant ? JSON.stringify(item.variant) : null
            }))
          }
        },
        include: {
          items: true
        }
      })
      console.log('Order created successfully:', order.id)
    } catch (dbError) {
      console.error('Database error creating order:', dbError)
      throw dbError
    }

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

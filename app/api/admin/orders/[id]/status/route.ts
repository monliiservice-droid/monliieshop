import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail, sendInvoiceEmail } from '@/lib/email'
import { createInvoiceForOrder, markInvoiceAsPaid } from '@/lib/invoice-generator'


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validace statusu
    const validStatuses = [
      'new',
      'accepted',
      'rejected',
      'in_production',
      'ready_to_ship',
      'shipped',
      'delivered',
      'cancelled'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Neplatný status' },
        { status: 400 }
      )
    }

    // Načti objednávku
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Objednávka nenalezena' },
        { status: 404 }
      )
    }

    // Aktualizuj status
    const updateData: any = { status }
    
    // Pokud je doručeno, nastav deliveredAt
    if (status === 'delivered' && !order.deliveredAt) {
      updateData.deliveredAt = new Date()
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Připrav data pro email
    const shippingAddress = JSON.parse(order.shippingAddress)
    const orderData = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: order.totalAmount,
      items: order.items.map(item => ({
        name: item.productName || item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      trackingNumber: order.trackingNumber || undefined
    }

    // Odešli příslušný email podle statusu
    switch (status) {
      case 'accepted':
        // Odešli email o přijetí objednávky
        await sendOrderEmail('order_accepted', orderData)
        
        // Vytvoř fakturu
        try {
          const invoice = await createInvoiceForOrder({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone || undefined,
            billingAddress: order.billingAddress || undefined,
            items: order.items.map(item => ({
              name: item.productName || item.product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.price
            })),
            totalAmount: order.totalAmount,
            discountAmount: order.discountAmount
          })
          
          // Pokud je objednávka už zaplacená, označ fakturu jako zaplacenou
          if (order.paymentStatus === 'paid') {
            await markInvoiceAsPaid(invoice.id)
          }
          
          // Odešli fakturu emailem
          await sendInvoiceEmail({
            invoiceNumber: invoice.invoiceNumber,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            totalAmount: invoice.totalAmount,
            subtotal: invoice.subtotal,
            vatAmount: invoice.vatAmount,
            vatRate: invoice.vatRate,
            items: invoice.items,
            issueDate: invoice.issueDate.toISOString(),
            dueDate: invoice.dueDate.toISOString(),
            status: order.paymentStatus === 'paid' ? 'paid' : invoice.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus
          })
          
          console.log(`Invoice ${invoice.invoiceNumber} created and sent for order ${order.orderNumber}`)
        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError)
          // Nepřerušuj process i když faktura selže
        }
        break
      case 'rejected':
        await sendOrderEmail('order_rejected', orderData)
        break
      case 'in_production':
        await sendOrderEmail('order_in_production', orderData)
        break
      case 'ready_to_ship':
        await sendOrderEmail('order_ready_to_ship', orderData)
        break
      case 'shipped':
        await sendOrderEmail('order_shipped', orderData)
        break
      case 'delivered':
        await sendOrderEmail('order_delivered', orderData)
        break
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { message: 'Chyba při aktualizaci statusu objednávky' },
      { status: 500 }
    )
  }
}

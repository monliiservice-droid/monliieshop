import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail, sendInvoiceEmail } from '@/lib/email'
import { createInvoiceForOrder, markInvoiceAsPaid } from '@/lib/invoice-generator'
import { requireAdminAuth } from '@/lib/auth'
import { RELEASED_STATUSES, reclaimOrderResources, releaseOrderResources } from '@/lib/order-inventory'

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
    const { status, trackingNumber: newTrackingNumber } = body

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
    
    // Update tracking number if provided (for shipped status)
    if (newTrackingNumber) {
      updateData.trackingNumber = newTrackingNumber
    }
    
    // For QR payments, mark as paid when accepting (admin confirms payment received)
    if (status === 'in_production' && order.paymentMethod === 'qr_code') {
      updateData.paymentStatus = 'paid'
    }

    // Při odmítnutí/zrušení vrátíme zboží na sklad a uvolníme slevový kód,
    // při návratu zrušené objednávky do běhu je zase zabereme
    const wasReleased = RELEASED_STATUSES.includes(order.status)
    const willBeReleased = RELEASED_STATUSES.includes(status)

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (!wasReleased && willBeReleased) {
        await releaseOrderResources(tx, order)
      } else if (wasReleased && !willBeReleased) {
        await reclaimOrderResources(tx, order)
      }
      return tx.order.update({
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
      // Nově zadané číslo zásilky má přednost před původním
      trackingNumber: updatedOrder.trackingNumber || undefined
    }

    // Odešli příslušný email podle statusu. Stav je už uložený, takže chyba
    // při odesílání nesmí vrátit 500 – admin jen dostane upozornění.
    let emailWarning: string | undefined
    try {
      switch (status) {
        case 'in_production':
          // Different logic based on payment method
          if (order.paymentMethod === 'qr_code') {
            // QR payment: Invoice was already sent at order creation
            // Just send "payment received + in production" email
            await sendOrderEmail('order_accepted', {
              ...orderData,
              paymentMethod: order.paymentMethod
            })
          
            // Mark existing invoice as paid
            try {
              const existingInvoice = await prisma.invoice.findFirst({
                where: { orderId: order.id }
              })
              if (existingInvoice) {
                await markInvoiceAsPaid(existingInvoice.id)
              }
            } catch (invoiceError) {
              console.error('Error marking invoice as paid:', invoiceError)
            }
          } else {
            // COD or store_payment: Create invoice now and send it with "in production" email
            await sendOrderEmail('order_accepted', {
              ...orderData,
              paymentMethod: order.paymentMethod
            })
          
            // Create and send invoice for COD/store_payment orders
            // (jen jednou – při opakovaném přepnutí do výroby nevystavujeme další fakturu)
            const existingInvoice = await prisma.invoice.findFirst({ where: { orderId: order.id } })
            if (!existingInvoice) try {
              const invoice = await createInvoiceForOrder({
                id: order.id,
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone || undefined,
                billingAddress: order.billingAddress || undefined,
                shippingAddress: order.shippingAddress,
                items: order.items.map(item => ({
                  name: item.productName || item.product?.name || 'Unknown Product',
                  quantity: item.quantity,
                  price: item.price
                })),
                totalAmount: order.totalAmount,
                discountCode: order.discountCode,
                discountAmount: order.discountAmount,
                shippingCost: order.shippingCost,
                codFee: order.codFee,
                shippingMethod: order.shippingMethod,
                paymentMethod: order.paymentMethod
              })
            
              // Send invoice email (payment upon delivery/pickup)
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
                status: 'unpaid',
                paymentMethod: order.paymentMethod,
                paymentStatus: 'pending'
              })
            
              console.log(`Invoice ${invoice.invoiceNumber} created and sent for ${order.paymentMethod} order ${order.orderNumber}`)
            } catch (invoiceError) {
              console.error('Error creating invoice:', invoiceError)
            }
          }
          break
        case 'rejected':
          await sendOrderEmail('order_rejected', orderData)
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
    } catch (emailError) {
      console.error('Error sending status email:', emailError)
      emailWarning = 'Stav byl uložen, ale e-mail zákazníkovi se nepodařilo odeslat.'
    }

    return NextResponse.json({ ...updatedOrder, emailWarning })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { message: 'Chyba při aktualizaci statusu objednávky' },
      { status: 500 }
    )
  }
}

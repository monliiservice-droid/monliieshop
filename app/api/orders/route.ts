import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail, sendOrderWithInvoiceEmail } from '@/lib/email'
import { generatePaymentQRCode } from '@/lib/qr-payment'
import { createInvoiceForOrder } from '@/lib/invoice-generator'
import { priceOrder, OrderValidationError } from '@/lib/order-pricing'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { reserveOrderResources } from '@/lib/order-inventory'

// Číslo objednávky: ORD- + 9 číslic (číslice slouží i jako variabilní symbol, max. 10 číslic)
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = randomInt(0, 1000).toString().padStart(3, '0')
  return `ORD-${timestamp}${random}`
}

const ORDER_NUMBER_ATTEMPTS = 5

const ORDER_LIMIT = 10
const ORDER_WINDOW_MS = 60 * 60 * 1000 // 1 hodina
const EMAIL_REGEX = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

// Z-BOX ukládáme jen se známými textovými poli, nic dalšího od klienta
function sanitizePickupPoint(point: any) {
  if (!point || typeof point !== 'object') return null
  const id = cleanString(String(point.id ?? ''), 50)
  const name = cleanString(point.name, 200)
  if (!id || !name) return null
  return {
    id,
    name,
    place: cleanString(point.place, 200),
    street: cleanString(point.street, 200),
    city: cleanString(point.city, 100),
    zip: cleanString(point.zip, 20),
    country: cleanString(point.country, 10),
    ...(typeof point.latitude === 'number' && { latitude: point.latitude }),
    ...(typeof point.longitude === 'number' && { longitude: point.longitude }),
    ...(typeof point.url === 'string' && /^https:\/\//.test(point.url) && { url: cleanString(point.url, 300) }),
  }
}

export async function POST(request: NextRequest) {
  const { allowed, retryAfterSeconds } = rateLimit(
    `orders:${getClientIp(request)}`,
    ORDER_LIMIT,
    ORDER_WINDOW_MS
  )
  if (!allowed) {
    return NextResponse.json(
      { message: 'Příliš mnoho objednávek v krátkém čase. Zkuste to prosím později.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  try {
    const data = await request.json()

    // Validace zákazníka
    const customer = data?.customer || {}
    const firstName = cleanString(customer.firstName, 100)
    const lastName = cleanString(customer.lastName, 100)
    const email = cleanString(customer.email, 254)
    const phone = cleanString(customer.phone, 30)
    const address = cleanString(customer.address, 200)
    const city = cleanString(customer.city, 100)
    const zip = cleanString(customer.zip, 20)
    const isCompany = customer.isCompany === true
    const company = cleanString(customer.company, 200)
    const ico = cleanString(customer.ico, 20)
    const dic = cleanString(customer.dic, 20)

    if (!firstName || !lastName || !email || !address || !city || !zip) {
      return NextResponse.json(
        { message: 'Vyplňte prosím všechny povinné údaje' },
        { status: 400 }
      )
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: 'Zadejte prosím platný email' },
        { status: 400 }
      )
    }
    if (isCompany && (!company || !ico)) {
      return NextResponse.json(
        { message: 'Vyplňte prosím název firmy a IČO' },
        { status: 400 }
      )
    }

    // Přepočet cen na serveru – hodnotám z prohlížeče nevěříme
    let priced
    try {
      priced = await priceOrder(data)
    } catch (error) {
      if (error instanceof OrderValidationError) {
        return NextResponse.json({ message: error.message, code: error.code }, { status: 400 })
      }
      throw error
    }

    // Validace místa doručení
    const pickupPoint = priced.shippingMethod === 'zbox'
      ? sanitizePickupPoint(data.shipping?.zbox || data.shipping?.pickupPoint)
      : null
    const personalLocation = priced.shippingMethod === 'personal'
      ? data.shipping?.personalLocation
      : null
    if (priced.shippingMethod === 'zbox' && !pickupPoint) {
      return NextResponse.json(
        { message: 'Chybí výdejní místo Z-BOX' },
        { status: 400 }
      )
    }
    if (priced.shippingMethod === 'personal' && personalLocation !== 'havirov' && personalLocation !== 'frenstat') {
      return NextResponse.json(
        { message: 'Vyberte prosím místo osobního odběru' },
        { status: 400 }
      )
    }

    // Pokud se cena zobrazená zákazníkovi liší od přepočtené, objednávku nevytvoříme,
    // aby zákazník nezaplatil jinou částku, než viděl (např. starý košík po změně cen)
    const clientTotal = Number(data.totalPrice)
    if (!Number.isFinite(clientTotal) || Math.abs(clientTotal - priced.total) > 0.5) {
      return NextResponse.json(
        {
          message: 'Ceny v košíku se mezitím změnily. Vraťte se prosím do košíku a zkontrolujte objednávku.',
          expectedTotal: priced.total,
        },
        { status: 409 }
      )
    }

    const customerAddress = {
      firstName,
      lastName,
      street: address,
      city,
      zip,
      ...(isCompany && { company, ico, dic })
    }

    // Vytvoření objednávky, odečtení skladu a použití slevového kódu v jedné transakci.
    // Při (nepravděpodobné) kolizi čísla objednávky zkusíme vygenerovat jiné.
    let order
    for (let attempt = 1; ; attempt++) {
      const orderNumber = generateOrderNumber()
      try {
        order = await prisma.$transaction(async (tx) => {
          await reserveOrderResources(tx, priced)
          return tx.order.create({
            data: {
              orderNumber,
              customerName: `${firstName} ${lastName}`,
              customerEmail: email,
              customerPhone: phone,
              shippingAddress: JSON.stringify({
                ...customerAddress,
                // Přidáme shipping details přímo do adresy
                shippingDetails: {
                  ...(pickupPoint && { pickupPoint }),
                  ...(personalLocation && { personalLocation })
                }
              }),
              // Fakturační údaje (vč. IČO/DIČ) pro automatické faktury
              billingAddress: JSON.stringify(customerAddress),
              shippingMethod: priced.shippingMethod,
              paymentMethod: priced.paymentMethod,
              totalAmount: priced.total,
              shippingCost: priced.shippingCost,
              codFee: priced.paymentFee,
              discountCode: priced.discount?.code ?? null,
              discountAmount: priced.discountAmount,
              status: 'new',
              items: {
                create: priced.items.map((item) => ({
                  productName: item.name,
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  variant: item.variant ? JSON.stringify(item.variant) : null
                }))
              }
            },
            include: {
              items: true
            }
          })
        })
        break
      } catch (error) {
        if (error instanceof OrderValidationError) {
          return NextResponse.json({ message: error.message, code: error.code }, { status: 409 })
        }
        const isOrderNumberCollision = error instanceof Prisma.PrismaClientKnownRequestError
          && error.code === 'P2002'
          && JSON.stringify(error.meta?.target ?? '').includes('orderNumber')
        if (!isOrderNumberCollision || attempt >= ORDER_NUMBER_ATTEMPTS) {
          throw error
        }
      }
    }
    console.log('Order created:', order.orderNumber)

    const emailItems = priced.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))
    if (priced.discount && priced.discountAmount > 0) {
      emailItems.push({
        name: `Sleva (kód ${priced.discount.code})`,
        quantity: 1,
        price: -priced.discountAmount
      })
    }

    // Generování QR platby pro qr_code payment method
    let qrPaymentData: ReturnType<typeof generatePaymentQRCode> | undefined = undefined
    if (order.paymentMethod === 'qr_code') {
      qrPaymentData = generatePaymentQRCode(order.orderNumber, order.totalAmount)
    }

    // Odeslání emailů
    try {
      const orderEmailData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        items: emailItems,
        shippingAddress: JSON.parse(order.shippingAddress),
        paymentMethod: order.paymentMethod,
        qrPaymentData
      }

      // QR payment: Create invoice immediately and send combined email with QR + invoice
      if (order.paymentMethod === 'qr_code') {
        try {
          const invoice = await createInvoiceForOrder({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone || undefined,
            billingAddress: order.billingAddress || undefined,
            shippingAddress: order.shippingAddress,
            // Bez řádku slevy – generátor faktury si ho přidá sám z discountAmount
            items: emailItems.filter((item) => item.price >= 0),
            totalAmount: order.totalAmount,
            discountCode: order.discountCode,
            discountAmount: order.discountAmount,
            shippingCost: order.shippingCost,
            codFee: order.codFee,
            shippingMethod: order.shippingMethod,
            paymentMethod: order.paymentMethod
          })
          
          // Send combined invoice + QR code email
          await sendOrderWithInvoiceEmail({
            ...orderEmailData,
            invoice: {
              invoiceNumber: invoice.invoiceNumber,
              subtotal: invoice.subtotal,
              vatAmount: invoice.vatAmount,
              vatRate: invoice.vatRate,
              items: invoice.items
            }
          })
        } catch (invoiceError) {
          console.error('Error creating invoice for QR order:', invoiceError)
          // Fallback to regular email if invoice fails
          await sendOrderEmail('order_received_customer', orderEmailData)
        }
      } else {
        // COD or store_payment: Just send order confirmation (invoice will be sent after admin accepts)
        await sendOrderEmail('order_received_customer', orderEmailData)
      }

      // Email prodejci (always)
      await sendOrderEmail('order_received_seller', orderEmailData)

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
      },
      qrPaymentData
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { message: 'Chyba při vytváření objednávky' },
      { status: 500 }
    )
  }
}

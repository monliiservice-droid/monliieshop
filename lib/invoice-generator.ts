import { prisma } from './prisma'

interface OrderData {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  billingAddress?: string
  items: any[]
  totalAmount: number
  discountAmount: number
}

/**
 * Automaticky vytvoří fakturu pro danou objednávku
 */
export async function createInvoiceForOrder(order: OrderData) {
  try {
    // Získáme nastavení firmy
    let companySettings = await prisma.companySettings.findFirst()
    
    // Pokud neexistuje, vytvoříme výchozí
    if (!companySettings) {
      companySettings = await prisma.companySettings.create({
        data: {
          companyName: 'Monlii',
          ico: '00000000',
          street: 'Hlavní 1',
          city: 'Praha',
          zip: '100 00',
          email: 'info@monlii.cz',
          phone: '+420 000 000 000',
        }
      })
    }

    // Vygenerujeme číslo faktury
    const invoiceNumber = `${companySettings.invoicePrefix}${String(companySettings.nextInvoiceNum).padStart(6, '0')}`

    // Parsujeme billing adresu
    let billingAddress
    try {
      billingAddress = order.billingAddress ? JSON.parse(order.billingAddress) : {}
    } catch {
      billingAddress = {}
    }

    // Získáme IČO a DIČ z billing adresy pokud existuje
    const customerIco = billingAddress.ico || null
    const customerDic = billingAddress.dic || null

    // Připravíme položky faktury
    const invoiceItems = order.items.map((item: any) => ({
      name: item.name || 'Produkt',
      quantity: item.quantity,
      price: item.price
    }))

    // Vypočítáme částky
    const totalWithDiscount = order.totalAmount
    const subtotal = companySettings.vatPayer 
      ? totalWithDiscount / (1 + companySettings.defaultVatRate / 100)
      : totalWithDiscount
    const vatAmount = companySettings.vatPayer 
      ? totalWithDiscount - subtotal
      : 0

    // Spočítáme datum splatnosti
    const issueDate = new Date()
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + companySettings.invoiceDueDays)

    // Vytvoříme fakturu
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        type: 'automatic',
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerAddress: order.billingAddress || JSON.stringify({}),
        customerIco,
        customerDic,
        items: JSON.stringify(invoiceItems),
        subtotal: Math.round(subtotal * 100) / 100,
        vatRate: companySettings.defaultVatRate,
        vatAmount: Math.round(vatAmount * 100) / 100,
        totalAmount: totalWithDiscount,
        notes: order.discountAmount > 0 ? `Sleva: ${order.discountAmount} Kč` : null,
        issueDate,
        dueDate,
        status: 'unpaid'
      }
    })

    // Zvýšíme číslo pro další fakturu
    await prisma.companySettings.update({
      where: { id: companySettings.id },
      data: {
        nextInvoiceNum: companySettings.nextInvoiceNum + 1
      }
    })

    return invoice
  } catch (error) {
    console.error('Error creating invoice for order:', error)
    throw error
  }
}

/**
 * Označí fakturu jako zaplacenou
 */
export async function markInvoiceAsPaid(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidDate: new Date()
      }
    })

    return invoice
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    throw error
  }
}

/**
 * Označí všechny faktury objednávky jako zaplacené
 */
export async function markOrderInvoicesAsPaid(orderId: string) {
  try {
    const invoices = await prisma.invoice.updateMany({
      where: { orderId },
      data: {
        status: 'paid',
        paidDate: new Date()
      }
    })

    return invoices
  } catch (error) {
    console.error('Error marking order invoices as paid:', error)
    throw error
  }
}

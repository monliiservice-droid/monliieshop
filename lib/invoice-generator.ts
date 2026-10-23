import type { CompanySettings, Prisma } from '@prisma/client'
import { prisma } from './prisma'

interface OrderData {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  billingAddress?: string
  shippingAddress?: string
  items: any[]
  totalAmount: number
  discountCode?: string | null
  discountAmount: number
  shippingCost?: number
  codFee?: number
  shippingMethod?: string
  paymentMethod?: string
}

export class CompanySettingsMissingError extends Error {
  constructor() {
    super('Nejsou vyplněné fakturační údaje firmy. Doplňte je v Administraci → Nastavení → Fakturace.')
  }
}

/**
 * Vytvoří fakturu s dalším číslem z řady. Navýšení čísla i vytvoření faktury proběhne
 * v jedné transakci – souběžné objednávky tak nedostanou stejné číslo a při chybě
 * nevznikne v číselné řadě díra.
 */
export async function createNumberedInvoice(
  buildData: (settings: CompanySettings) => Omit<Prisma.InvoiceUncheckedCreateInput, 'invoiceNumber'>
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.companySettings.findFirst()
    if (!existing) {
      throw new CompanySettingsMissingError()
    }

    // UPDATE zamkne řádek nastavení až do konce transakce
    const settings = await tx.companySettings.update({
      where: { id: existing.id },
      data: { nextInvoiceNum: { increment: 1 } }
    })
    const invoiceNumber = `${settings.invoicePrefix}${String(settings.nextInvoiceNum - 1).padStart(6, '0')}`

    return tx.invoice.create({
      data: { ...buildData(settings), invoiceNumber }
    })
  })
}

function parseAddress(json?: string): Record<string, any> {
  if (!json) return {}
  try {
    return JSON.parse(json) || {}
  } catch {
    return {}
  }
}

/**
 * Automaticky vytvoří fakturu pro danou objednávku
 */
export async function createInvoiceForOrder(order: OrderData) {
  try {
    // Fakturační adresa; starší objednávky ji nemají, použijeme adresu z objednávky
    const billingAddress = order.billingAddress
      ? parseAddress(order.billingAddress)
      : parseAddress(order.shippingAddress)

    const customerAddress = {
      street: billingAddress.street || '',
      city: billingAddress.city || '',
      zip: billingAddress.zip || '',
      ...(billingAddress.company && { company: billingAddress.company }),
    }

    // Připravíme položky faktury
    const invoiceItems = order.items.map((item: any) => ({
      name: item.name || 'Produkt',
      quantity: item.quantity,
      price: item.price
    }))
    
    // Přidáme dopravné jako položku (pokud není 0)
    if (order.shippingCost && order.shippingCost > 0) {
      const shippingMethodNames: Record<string, string> = {
        'zbox': 'Doprava - Zásilkovna Z-BOX',
        'zasilkovna_pickup': 'Doprava - Zásilkovna (výdejní místo)',
        'zasilkovna_home': 'Doprava - Zásilkovna (doručení domů)',
        'personal': 'Osobní odběr'
      }
      invoiceItems.push({
        name: shippingMethodNames[order.shippingMethod || ''] || 'Doprava',
        quantity: 1,
        price: order.shippingCost
      })
    }
    
    // Přidáme poplatek za dobírku (pokud není 0)
    if (order.codFee && order.codFee > 0) {
      invoiceItems.push({
        name: 'Poplatek za dobírku',
        quantity: 1,
        price: order.codFee
      })
    }

    // Sleva jako záporná položka, aby součet položek odpovídal celkové částce
    if (order.discountAmount > 0) {
      invoiceItems.push({
        name: order.discountCode ? `Sleva (kód ${order.discountCode})` : 'Sleva',
        quantity: 1,
        price: -order.discountAmount
      })
    }

    return await createNumberedInvoice((companySettings) => {
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

      return {
        orderId: order.id,
        type: 'automatic',
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerAddress: JSON.stringify(customerAddress),
        customerIco: billingAddress.ico || null,
        customerDic: billingAddress.dic || null,
        items: JSON.stringify(invoiceItems),
        subtotal: Math.round(subtotal * 100) / 100,
        vatRate: companySettings.vatPayer ? companySettings.defaultVatRate : 0,
        vatAmount: Math.round(vatAmount * 100) / 100,
        totalAmount: totalWithDiscount,
        notes: null,
        issueDate,
        dueDate,
        status: 'unpaid'
      }
    })
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

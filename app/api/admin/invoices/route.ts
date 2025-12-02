import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'

// GET - načíst všechny faktury
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true
          }
        }
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání faktur' },
      { status: 500 }
    )
  }
}

// POST - vytvořit manuální fakturu
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Získáme aktuální nastavení firmy pro generování čísla faktury
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

    // Vypočítáme DPH
    const subtotal = parseFloat(data.subtotal)
    const vatRate = data.vatRate || companySettings.defaultVatRate
    const vatAmount = (subtotal * vatRate) / 100
    const totalAmount = subtotal + vatAmount

    // Spočítáme datum splatnosti
    const issueDate = data.issueDate ? new Date(data.issueDate) : new Date()
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + (data.dueDays || companySettings.invoiceDueDays))

    // Vytvoříme fakturu
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        type: 'manual',
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: JSON.stringify(data.customerAddress),
        customerIco: data.customerIco,
        customerDic: data.customerDic,
        items: JSON.stringify(data.items),
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        notes: data.notes,
        issueDate,
        dueDate,
        status: data.status || 'unpaid'
      }
    })

    // Zvýšíme číslo pro další fakturu
    await prisma.companySettings.update({
      where: { id: companySettings.id },
      data: {
        nextInvoiceNum: companySettings.nextInvoiceNum + 1
      }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { message: 'Chyba při vytváření faktury' },
      { status: 500 }
    )
  }
}

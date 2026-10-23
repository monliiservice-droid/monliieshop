import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { createNumberedInvoice, CompanySettingsMissingError } from '@/lib/invoice-generator'

// GET - načíst všechny faktury
export async function GET() {
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
  const isAuthed = await requireAdminAuth()
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const subtotal = parseFloat(data.subtotal)
    if (!Number.isFinite(subtotal)) {
      return NextResponse.json(
        { message: 'Neplatná částka faktury' },
        { status: 400 }
      )
    }

    const invoice = await createNumberedInvoice((companySettings) => {
      // Vypočítáme DPH
      const vatRate = data.vatRate ?? (companySettings.vatPayer ? companySettings.defaultVatRate : 0)
      const vatAmount = (subtotal * vatRate) / 100
      const totalAmount = subtotal + vatAmount

      // Spočítáme datum splatnosti
      const issueDate = data.issueDate ? new Date(data.issueDate) : new Date()
      const dueDate = new Date(issueDate)
      dueDate.setDate(dueDate.getDate() + (data.dueDays || companySettings.invoiceDueDays))

      return {
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

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    if (error instanceof CompanySettingsMissingError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { message: 'Chyba při vytváření faktury' },
      { status: 500 }
    )
  }
}

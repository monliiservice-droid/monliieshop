import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - načíst fakturační údaje
export async function GET() {
  try {
    const settings = await prisma.companySettings.findFirst()
    
    if (!settings) {
      return NextResponse.json(null)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání fakturačních údajů' },
      { status: 500 }
    )
  }
}

// POST - uložit/aktualizovat fakturační údaje
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Zkontrolujeme, jestli nastavení už existuje
    const existing = await prisma.companySettings.findFirst()

    let settings
    if (existing) {
      // Aktualizace
      settings = await prisma.companySettings.update({
        where: { id: existing.id },
        data: {
          companyName: data.companyName,
          ico: data.ico,
          dic: data.dic,
          street: data.street,
          city: data.city,
          zip: data.zip,
          country: data.country,
          email: data.email,
          phone: data.phone,
          bankAccount: data.bankAccount,
          iban: data.iban,
          swift: data.swift,
          invoicePrefix: data.invoicePrefix,
          defaultVatRate: data.defaultVatRate,
          invoiceDueDays: data.invoiceDueDays,
          vatPayer: data.vatPayer,
          updatedAt: new Date()
        }
      })
    } else {
      // Vytvoření nového
      settings = await prisma.companySettings.create({
        data: {
          companyName: data.companyName,
          ico: data.ico,
          dic: data.dic,
          street: data.street,
          city: data.city,
          zip: data.zip,
          country: data.country || 'Česká republika',
          email: data.email,
          phone: data.phone,
          bankAccount: data.bankAccount,
          iban: data.iban,
          swift: data.swift,
          invoicePrefix: data.invoicePrefix || '',
          defaultVatRate: data.defaultVatRate || 21,
          invoiceDueDays: data.invoiceDueDays || 14,
          vatPayer: data.vatPayer !== undefined ? data.vatPayer : true,
          nextInvoiceNum: 1
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving company settings:', error)
    return NextResponse.json(
      { message: 'Chyba při ukládání fakturačních údajů' },
      { status: 500 }
    )
  }
}

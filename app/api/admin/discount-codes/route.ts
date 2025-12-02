import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET - načíst všechny slevové kódy
export async function GET() {
  try {
    const codes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(codes)
  } catch (error) {
    console.error('Error fetching discount codes:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání slevových kódů' },
      { status: 500 }
    )
  }
}

// POST - vytvořit nový slevový kód
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validace
    if (!data.code || !data.type || data.value === undefined) {
      return NextResponse.json(
        { message: 'Chybí povinná pole' },
        { status: 400 }
      )
    }

    // Kontrola zda kód již neexistuje
    const existing = await prisma.discountCode.findUnique({
      where: { code: data.code.toUpperCase() }
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Tento slevový kód již existuje' },
        { status: 400 }
      )
    }

    // Vytvořit nový kód
    const code = await prisma.discountCode.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: parseFloat(data.value),
        minAmount: data.minAmount ? parseFloat(data.minAmount) : null,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      }
    })

    return NextResponse.json(code, { status: 201 })
  } catch (error) {
    console.error('Error creating discount code:', error)
    return NextResponse.json(
      { message: 'Chyba při vytváření slevového kódu' },
      { status: 500 }
    )
  }
}

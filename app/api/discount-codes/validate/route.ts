import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json()

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Slevový kód je povinný' },
        { status: 400 }
      )
    }

    // Najít slevový kód v databázi
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    // Kontroly platnosti
    if (!discountCode) {
      return NextResponse.json(
        { valid: false, message: 'Slevový kód nebyl nalezen' },
        { status: 404 }
      )
    }

    if (!discountCode.isActive) {
      return NextResponse.json(
        { valid: false, message: 'Slevový kód již není aktivní' },
        { status: 400 }
      )
    }

    // Kontrola data platnosti
    const now = new Date()
    if (discountCode.validFrom && new Date(discountCode.validFrom) > now) {
      return NextResponse.json(
        { valid: false, message: 'Slevový kód ještě není platný' },
        { status: 400 }
      )
    }

    if (discountCode.validUntil && new Date(discountCode.validUntil) < now) {
      return NextResponse.json(
        { valid: false, message: 'Platnost slevového kódu již vypršela' },
        { status: 400 }
      )
    }

    // Kontrola maximálního počtu použití
    if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
      return NextResponse.json(
        { valid: false, message: 'Slevový kód byl již využit maximální počet krát' },
        { status: 400 }
      )
    }

    // Kontrola minimální částky objednávky
    if (discountCode.minAmount && orderAmount < discountCode.minAmount) {
      return NextResponse.json(
        { 
          valid: false, 
          message: `Minimální částka objednávky pro tento kód je ${discountCode.minAmount} Kč` 
        },
        { status: 400 }
      )
    }

    // Slevový kód je platný
    return NextResponse.json({
      valid: true,
      discount: {
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value
      }
    })

  } catch (error) {
    console.error('Error validating discount code:', error)
    return NextResponse.json(
      { valid: false, message: 'Chyba při ověřování slevového kódu' },
      { status: 500 }
    )
  }
}

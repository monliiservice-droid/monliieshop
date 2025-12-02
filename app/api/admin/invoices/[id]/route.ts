import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - získat detaily faktury
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { message: 'Faktura nenalezena' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání faktury' },
      { status: 500 }
    )
  }
}

// PATCH - aktualizovat fakturu
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json()
    const { id } = await params

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { message: 'Chyba při aktualizaci faktury' },
      { status: 500 }
    )
  }
}

// DELETE - smazat fakturu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.invoice.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Faktura byla smazána' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { message: 'Chyba při mazání faktury' },
      { status: 500 }
    )
  }
}

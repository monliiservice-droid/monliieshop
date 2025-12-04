import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Temporary placeholder - PDF generation not yet implemented
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

    // TODO: Implement PDF generation
    // This endpoint is a placeholder for future PDF generation functionality
    // Requires installing a PDF library like 'pdfkit' or 'jspdf'
    
    return NextResponse.json(
      { 
        message: 'Export faktur do PDF zatím není implementován',
        info: 'Tato funkcionalita bude doplněna v příští aktualizaci. Prozatím můžete faktury zobrazit v admin rozhraní.',
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status
      },
      { status: 501 } // 501 Not Implemented
    )
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { message: 'Chyba při generování PDF' },
      { status: 500 }
    )
  }
}

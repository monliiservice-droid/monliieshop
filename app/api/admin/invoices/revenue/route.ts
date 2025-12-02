import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'

// GET - získat měsíční tržby
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'paid'
      },
      select: {
        issueDate: true,
        totalAmount: true
      }
    })

    // Seskupíme tržby po měsících
    const revenueByMonth: { [key: string]: { revenue: number, invoices: number } } = {}

    invoices.forEach(invoice => {
      const date = new Date(invoice.issueDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { revenue: 0, invoices: 0 }
      }
      
      revenueByMonth[monthKey].revenue += invoice.totalAmount
      revenueByMonth[monthKey].invoices += 1
    })

    // Převedeme na pole a seřadíme
    const revenueData = Object.entries(revenueByMonth)
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue),
        invoices: data.invoices
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return NextResponse.json(revenueData)
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání tržeb' },
      { status: 500 }
    )
  }
}

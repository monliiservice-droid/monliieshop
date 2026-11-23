import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminErrorResponse, unauthorizedResponse } from '@/lib/admin-api'
import { BUILT_IN_SIZE_CHARTS } from '@/lib/size-charts'

/** Tabulky velikostí, které už e-shop používá (vestavěné + nahrané u produktů) – pro výběr u produktu */
export async function GET() {
  const denied = await unauthorizedResponse()
  if (denied) return denied
  try {
    const rows = await prisma.product.findMany({
      where: { sizeChart: { not: null } },
      select: { sizeChart: true, name: true },
      orderBy: { updatedAt: 'desc' },
    })
    const charts = [...BUILT_IN_SIZE_CHARTS]
    for (const row of rows) {
      if (row.sizeChart && !charts.some((c) => c.url === row.sizeChart)) {
        charts.push({ url: row.sizeChart, label: `Z produktu ${row.name}` })
      }
    }
    return NextResponse.json(charts)
  } catch (err) {
    return adminErrorResponse(err, 'Tabulky se nepodařilo načíst')
  }
}

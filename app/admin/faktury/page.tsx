import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, AlertCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true
          }
        }
      },
      take: 50 // Limit to last 50 invoices
    })
    return invoices
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return []
  }
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: 'Zaplaceno', className: 'bg-green-100 text-green-800' },
      unpaid: { label: 'Nezaplaceno', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Stornováno', className: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Faktury</h1>
        <p className="text-gray-600">Přehled všech vystavených faktur</p>
      </div>

      {/* PDF Export Warning */}
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">
                Export faktur do PDF zatím není implementován
              </h3>
              <p className="text-sm text-orange-800">
                Funkce generování PDF faktur bude doplněna v příští aktualizaci. 
                Prozatím můžete faktury zobrazit zde v administraci nebo poslat zákazníkovi emailem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seznam faktur ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Zatím nebyly vytvořeny žádné faktury.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Číslo faktury</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Objednávka</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Zákazník</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Částka</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Vystaveno</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Splatnost</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Stav</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const status = getStatusBadge(invoice.status)
                    return (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-semibold">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Link 
                            href={`/admin/objednavky`}
                            className="text-[#931e31] hover:underline"
                          >
                            {invoice.order?.orderNumber || '-'}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm">{invoice.customerName}</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {invoice.totalAmount.toLocaleString('cs-CZ')} Kč
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={status.className}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="opacity-50 cursor-not-allowed"
                            title="Export do PDF zatím není k dispozici"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

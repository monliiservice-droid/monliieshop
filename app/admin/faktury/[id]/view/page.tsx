import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface InvoiceViewPageProps {
  params: Promise<{ id: string }>
}

async function getInvoiceData(id: string) {
  try {
    const [invoice, companySettings] = await Promise.all([
      prisma.invoice.findUnique({
        where: { id },
        include: {
          order: {
            select: {
              orderNumber: true,
              shippingAddress: true,
            }
          }
        }
      }),
      prisma.companySettings.findFirst()
    ])

    if (!invoice) return null

    return { invoice, companySettings }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return null
  }
}

export default async function InvoiceViewPage({ params }: InvoiceViewPageProps) {
  const { id } = await params
  const data = await getInvoiceData(id)

  if (!data) {
    notFound()
  }

  const { invoice, companySettings } = data

  // Parse invoice items
  let items: any[] = []
  try {
    items = JSON.parse(invoice.items as string)
  } catch {
    items = []
  }

  // Parse customer address
  let customerAddress: any = {}
  try {
    customerAddress = JSON.parse(invoice.customerAddress)
  } catch {
    customerAddress = {}
  }

  return (
    <>
      {/* Print controls - hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={() => window.print()}
          className="bg-[#931e31] hover:bg-[#6b1623]"
        >
          <Printer className="h-4 w-4 mr-2" />
          Tisknout / Uložit jako PDF
        </Button>
      </div>

      {/* Invoice HTML */}
      <div className="invoice-container max-w-4xl mx-auto p-8 bg-white">
        <style jsx global>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .invoice-container {
              max-width: 100%;
              padding: 20mm;
            }
          }
          
          @page {
            size: A4;
            margin: 0;
          }
        `}</style>

        {/* Header */}
        <div className="mb-12 border-b-2 border-[#931e31] pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-[#931e31] mb-2">FAKTURA</h1>
              <p className="text-xl font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-2">{companySettings?.companyName || 'Monlii'}</h2>
              <p className="text-gray-600">{companySettings?.street}</p>
              <p className="text-gray-600">{companySettings?.zip} {companySettings?.city}</p>
              {companySettings?.ico && <p className="text-gray-600 mt-2">IČO: {companySettings.ico}</p>}
              {companySettings?.dic && <p className="text-gray-600">DIČ: {companySettings.dic}</p>}
            </div>
          </div>
        </div>

        {/* Invoice details and customer */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Invoice info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Údaje faktury</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-semibold w-32">Číslo faktury:</span>
                <span>{invoice.invoiceNumber}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Datum vystavení:</span>
                <span>{new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Datum splatnosti:</span>
                <span>{new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}</span>
              </div>
              {invoice.order && (
                <div className="flex">
                  <span className="font-semibold w-32">Objednávka:</span>
                  <span>{invoice.order.orderNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Odběratel</h3>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{invoice.customerName}</p>
              {customerAddress.street && <p>{customerAddress.street}</p>}
              {customerAddress.city && (
                <p>{customerAddress.zip} {customerAddress.city}</p>
              )}
              {invoice.customerIco && <p className="mt-2">IČO: {invoice.customerIco}</p>}
              {invoice.customerDic && <p>DIČ: {invoice.customerDic}</p>}
              {invoice.customerEmail && <p className="mt-2">{invoice.customerEmail}</p>}
              {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-3 font-semibold">Položka</th>
                <th className="text-center p-3 font-semibold w-24">Množství</th>
                <th className="text-right p-3 font-semibold w-32">Cena/ks</th>
                <th className="text-right p-3 font-semibold w-32">Celkem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">{item.price.toLocaleString('cs-CZ')} Kč</td>
                  <td className="p-3 text-right font-semibold">
                    {(item.price * item.quantity).toLocaleString('cs-CZ')} Kč
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-80">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2">
                <span className="font-semibold">Mezisoučet bez DPH:</span>
                <span>{invoice.subtotal.toLocaleString('cs-CZ')} Kč</span>
              </div>
              {invoice.vatAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="font-semibold">DPH ({invoice.vatRate}%):</span>
                  <span>{invoice.vatAmount.toLocaleString('cs-CZ')} Kč</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-gray-300 text-lg">
                <span className="font-bold">Celkem k úhradě:</span>
                <span className="font-bold text-[#931e31]">
                  {invoice.totalAmount.toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment info */}
        {companySettings && (
          <div className="border-t pt-6">
            <h3 className="font-bold mb-3">Platební údaje</h3>
            <div className="text-sm space-y-1">
              {companySettings.bankAccount && (
                <p><strong>Číslo účtu:</strong> {companySettings.bankAccount}</p>
              )}
              {companySettings.iban && (
                <p><strong>IBAN:</strong> {companySettings.iban}</p>
              )}
              {companySettings.swift && (
                <p><strong>SWIFT/BIC:</strong> {companySettings.swift}</p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-sm"><strong>Poznámka:</strong> {invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          <p>{companySettings?.companyName || 'Monlii'}</p>
          {companySettings?.email && <p>Email: {companySettings.email}</p>}
          {companySettings?.phone && <p>Tel: {companySettings.phone}</p>}
        </div>
      </div>
    </>
  )
}

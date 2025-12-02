'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TrendingUp, FileText, Plus, Calendar, Download, Eye, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  customerAddress: string
  customerIco: string | null
  customerDic: string | null
  items: string
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  notes: string | null
  status: string
  issueDate: string
  dueDate: string
  paidDate: string | null
  type: string
}

interface MonthlyRevenue {
  month: string
  revenue: number
  invoices: number
}

export default function TrzbyPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [paidInvoices, setPaidInvoices] = useState(0)
  const [unpaidInvoices, setUnpaidInvoices] = useState(0)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: { street: '', city: '', zip: '' },
    customerIco: '',
    customerDic: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    subtotal: 0,
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [invoicesRes, revenueRes] = await Promise.all([
        fetch('/api/admin/invoices'),
        fetch('/api/admin/invoices/revenue')
      ])

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData)
        
        // Vypočítáme statistiky
        const paid = invoicesData.filter((inv: Invoice) => inv.status === 'paid')
        const unpaid = invoicesData.filter((inv: Invoice) => inv.status === 'unpaid')
        setPaidInvoices(paid.length)
        setUnpaidInvoices(unpaid.length)
        setTotalRevenue(paid.reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0))
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json()
        setMonthlyRevenue(revenueData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredInvoices = () => {
    if (!selectedMonth) return invoices
    
    return invoices.filter(inv => {
      const invDate = new Date(inv.issueDate)
      const monthYear = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`
      return monthYear === selectedMonth
    })
  }

  const handleCreateInvoice = async () => {
    // Validace
    if (!formData.customerName || !formData.customerEmail || !formData.customerAddress.street || !formData.customerAddress.city || !formData.customerAddress.zip) {
      alert('Vyplňte všechna povinná pole')
      return
    }

    if (formData.items.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
      alert('Všechny položky musí mít název, množství a cenu')
      return
    }

    try {
      const subtotal = calculateSubtotal()
      const payload = {
        ...formData,
        subtotal
      }

      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('Faktura byla úspěšně vytvořena')
        setShowCreateForm(false)
        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerAddress: { street: '', city: '', zip: '' },
          customerIco: '',
          customerDic: '',
          items: [{ name: '', quantity: 1, price: 0 }],
          subtotal: 0,
          notes: ''
        })
        await fetchData()
      } else {
        const error = await res.json()
        alert(error.message || 'Chyba při vytváření faktury')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Chyba při vytváření faktury')
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }]
    })
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowDetail(true)
  }

  const handleChangeStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          paidDate: newStatus === 'paid' ? new Date().toISOString() : null
        })
      })

      if (res.ok) {
        alert(`Faktura označena jako: ${newStatus === 'paid' ? 'zaplacená' : 'nezaplacená'}`)
        await fetchData()
        if (selectedInvoice && selectedInvoice.id === invoiceId) {
          const updated = await res.json()
          setSelectedInvoice(updated)
        }
      } else {
        alert('Chyba při změně statusu')
      }
    } catch (error) {
      console.error('Error changing status:', error)
      alert('Chyba při změně statusu')
    }
  }

  const handleDownloadPDF = (invoice: Invoice) => {
    // TODO: Implementace PDF generování
    alert('Export do PDF bude brzy k dispozici')
  }

  const handleEditInvoice = (invoice: Invoice) => {
    // Připravíme data pro formulář
    try {
      const items = JSON.parse(invoice.items)
      const address = JSON.parse(invoice.customerAddress)
      
      setFormData({
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerPhone: invoice.customerPhone || '',
        customerAddress: address,
        customerIco: invoice.customerIco || '',
        customerDic: invoice.customerDic || '',
        items: items,
        subtotal: invoice.subtotal,
        notes: invoice.notes || ''
      })
      
      setSelectedInvoice(invoice)
      setIsEditMode(true)
      setShowDetail(false)
      setShowEditForm(true)
    } catch (error) {
      console.error('Error preparing edit form:', error)
      alert('Chyba při načítání dat faktury')
    }
  }

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return

    // Validace
    if (!formData.customerName || !formData.customerEmail || !formData.customerAddress.street || !formData.customerAddress.city || !formData.customerAddress.zip) {
      alert('Vyplnťte všechna povinná pole')
      return
    }

    if (formData.items.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
      alert('Všechny položky musí mít název, množství a cenu')
      return
    }

    try {
      const subtotal = calculateSubtotal()
      const payload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: JSON.stringify(formData.customerAddress),
        customerIco: formData.customerIco,
        customerDic: formData.customerDic,
        items: JSON.stringify(formData.items),
        subtotal,
        notes: formData.notes
      }

      const res = await fetch(`/api/admin/invoices/${selectedInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('Faktura byla úspěšně aktualizována')
        setShowEditForm(false)
        setIsEditMode(false)
        setSelectedInvoice(null)
        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerAddress: { street: '', city: '', zip: '' },
          customerIco: '',
          customerDic: '',
          items: [{ name: '', quantity: 1, price: 0 }],
          subtotal: 0,
          notes: ''
        })
        await fetchData()
      } else {
        const error = await res.json()
        alert(error.message || 'Chyba při aktualizaci faktury')
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Chyba při aktualizaci faktury')
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Opravdu chcete smazat tuto fakturu? Tuto akci nelze vrátit zpět.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Faktura byla úspěšně smazána')
        setShowDetail(false)
        setSelectedInvoice(null)
        await fetchData()
      } else {
        const error = await res.json()
        alert(error.message || 'Chyba při mazání faktury')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Chyba při mazání faktury')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'unpaid': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Zaplaceno'
      case 'unpaid': return 'Nezaplaceno'
      case 'overdue': return 'Po splatnosti'
      case 'cancelled': return 'Zrušeno'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Načítání...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Modal pro zobrazení detailu faktury */}
      {showDetail && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detail faktury {selectedInvoice.invoiceNumber}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetail(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status a akce */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedInvoice.status)}`}>
                    {getStatusLabel(selectedInvoice.status)}
                  </span>
                  <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                    {selectedInvoice.type === 'automatic' ? 'Automatická' : 'Manuální'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedInvoice.status === 'unpaid' && (
                    <Button
                      onClick={() => handleChangeStatus(selectedInvoice.id, 'paid')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Označit jako zaplacenou
                    </Button>
                  )}
                  {selectedInvoice.status === 'paid' && (
                    <Button
                      onClick={() => handleChangeStatus(selectedInvoice.id, 'unpaid')}
                      variant="outline"
                    >
                      Označit jako nezaplacenou
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDownloadPDF(selectedInvoice)}
                    className="bg-[#931e31] hover:bg-[#6b1623]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Stáhnout PDF
                  </Button>
                </div>
              </div>

              {/* Údaje zákazníka */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Údaje zákazníka</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Jméno</p>
                    <p className="font-semibold">{selectedInvoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold">{selectedInvoice.customerEmail}</p>
                  </div>
                  {selectedInvoice.customerPhone && (
                    <div>
                      <p className="text-gray-600">Telefon</p>
                      <p className="font-semibold">{selectedInvoice.customerPhone}</p>
                    </div>
                  )}
                  {selectedInvoice.customerIco && (
                    <div>
                      <p className="text-gray-600">IČO</p>
                      <p className="font-semibold">{selectedInvoice.customerIco}</p>
                    </div>
                  )}
                  {selectedInvoice.customerDic && (
                    <div>
                      <p className="text-gray-600">DIČ</p>
                      <p className="font-semibold">{selectedInvoice.customerDic}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-gray-600">Adresa</p>
                    <p className="font-semibold">
                      {(() => {
                        try {
                          const addr = JSON.parse(selectedInvoice.customerAddress)
                          return `${addr.street}, ${addr.zip} ${addr.city}`
                        } catch {
                          return selectedInvoice.customerAddress
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Položky */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Položky faktury</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Položka</th>
                        <th className="text-right p-3 font-semibold">Množství</th>
                        <th className="text-right p-3 font-semibold">Cena/ks</th>
                        <th className="text-right p-3 font-semibold">Celkem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        try {
                          const items = JSON.parse(selectedInvoice.items)
                          return items.map((item: any, index: number) => (
                            <tr key={index} className="border-t">
                              <td className="p-3">{item.name}</td>
                              <td className="text-right p-3">{item.quantity}</td>
                              <td className="text-right p-3">{item.price.toLocaleString('cs-CZ')} Kč</td>
                              <td className="text-right p-3 font-semibold">
                                {(item.quantity * item.price).toLocaleString('cs-CZ')} Kč
                              </td>
                            </tr>
                          ))
                        } catch {
                          return <tr><td colSpan={4} className="p-3 text-center text-gray-500">Chyba při načítání položek</td></tr>
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Částky */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Částka bez DPH:</span>
                  <span className="font-semibold">{selectedInvoice.subtotal.toLocaleString('cs-CZ')} Kč</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>DPH ({selectedInvoice.vatRate}%):</span>
                  <span className="font-semibold">{selectedInvoice.vatAmount.toLocaleString('cs-CZ')} Kč</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Celkem:</span>
                  <span>{selectedInvoice.totalAmount.toLocaleString('cs-CZ')} Kč</span>
                </div>
              </div>

              {/* Data */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Datum vystavení</p>
                  <p className="font-semibold">{new Date(selectedInvoice.issueDate).toLocaleDateString('cs-CZ')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Datum splatnosti</p>
                  <p className="font-semibold">{new Date(selectedInvoice.dueDate).toLocaleDateString('cs-CZ')}</p>
                </div>
                {selectedInvoice.paidDate && (
                  <div>
                    <p className="text-gray-600">Datum zaplacení</p>
                    <p className="font-semibold">{new Date(selectedInvoice.paidDate).toLocaleDateString('cs-CZ')}</p>
                  </div>
                )}
              </div>

              {/* Poznámka */}
              {selectedInvoice.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Poznámka</h3>
                  <p className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-lg">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Akční tlačítka */}
              <div className="flex gap-4 justify-end pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                >
                  Smazat fakturu
                </Button>
                <Button
                  onClick={() => handleEditInvoice(selectedInvoice)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Upravit fakturu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pro úpravu faktury */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Upravit fakturu {selectedInvoice?.invoiceNumber}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditForm(false)
                  setIsEditMode(false)
                  setSelectedInvoice(null)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Zákazník */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Údaje zákazníka</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Jméno zákazníka *</Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Jan Novák"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="+420 123 456 789"
                    />
                  </div>
                  <div>
                    <Label>IČO</Label>
                    <Input
                      value={formData.customerIco}
                      onChange={(e) => setFormData({ ...formData, customerIco: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <Label>DIČ</Label>
                    <Input
                      value={formData.customerDic}
                      onChange={(e) => setFormData({ ...formData, customerDic: e.target.value })}
                      placeholder="CZ12345678"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Adresa</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label>Ulice a číslo *</Label>
                      <Input
                        value={formData.customerAddress.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerAddress: { ...formData.customerAddress, street: e.target.value }
                        })}
                        placeholder="Hlavní 123"
                      />
                    </div>
                    <div>
                      <Label>PSČ *</Label>
                      <Input
                        value={formData.customerAddress.zip}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerAddress: { ...formData.customerAddress, zip: e.target.value }
                        })}
                        placeholder="100 00"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Město *</Label>
                      <Input
                        value={formData.customerAddress.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerAddress: { ...formData.customerAddress, city: e.target.value }
                        })}
                        placeholder="Praha"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Položky */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Položky faktury</h3>
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Přidat položku
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label>Název *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Produkt"
                        />
                      </div>
                      <div className="w-24">
                        <Label>Množství *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>Cena (Kč) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Celkem bez DPH:</span>
                    <span>{calculateSubtotal().toLocaleString('cs-CZ')} Kč</span>
                  </div>
                </div>
              </div>

              {/* Poznámka */}
              <div>
                <Label>Poznámka</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Volitelná poznámka k faktuře..."
                  rows={3}
                />
              </div>

              {/* Tlačítka */}
              <div className="flex gap-4 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false)
                    setIsEditMode(false)
                    setSelectedInvoice(null)
                  }}
                >
                  Zrušit
                </Button>
                <Button
                  onClick={handleUpdateInvoice}
                  className="bg-[#931e31] hover:bg-[#6b1623]"
                >
                  Uložit změny
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pro vytvoření faktury */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Vytvořit manuální fakturu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Zákazník */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Údaje zákazníka</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Jméno zákazníka *</Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Jan Novák"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="+420 123 456 789"
                    />
                  </div>
                  <div>
                    <Label>IČO</Label>
                    <Input
                      value={formData.customerIco}
                      onChange={(e) => setFormData({ ...formData, customerIco: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <Label>DIČ</Label>
                    <Input
                      value={formData.customerDic}
                      onChange={(e) => setFormData({ ...formData, customerDic: e.target.value })}
                      placeholder="CZ12345678"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Adresa</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label>Ulice a číslo *</Label>
                      <Input
                        value={formData.customerAddress.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerAddress: { ...formData.customerAddress, street: e.target.value }
                        })}
                        placeholder="Hlavní 123"
                      />
                    </div>
                    <div>
                      <Label>PSČ *</Label>
                      <Input
                        value={formData.customerAddress.zip}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerAddress: { ...formData.customerAddress, zip: e.target.value }
                        })}
                        placeholder="100 00"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Město *</Label>
                      <Input
                        value={formData.customerAddress.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          customerAddress: { ...formData.customerAddress, city: e.target.value }
                        })}
                        placeholder="Praha"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Položky */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Položky faktury</h3>
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Přidat položku
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label>Název *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Produkt"
                        />
                      </div>
                      <div className="w-24">
                        <Label>Množství *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>Cena (Kč) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Celkem bez DPH:</span>
                    <span>{calculateSubtotal().toLocaleString('cs-CZ')} Kč</span>
                  </div>
                </div>
              </div>

              {/* Poznámka */}
              <div>
                <Label>Poznámka</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Volitelná poznámka k faktuře..."
                  rows={3}
                />
              </div>

              {/* Tlačítka */}
              <div className="flex gap-4 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Zrušit
                </Button>
                <Button
                  onClick={handleCreateInvoice}
                  className="bg-[#931e31] hover:bg-[#6b1623]"
                >
                  Vytvořit fakturu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tržby a Faktury</h1>
          <p className="text-gray-600">Přehled tržeb a správa faktur</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-[#931e31] hover:bg-[#6b1623]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Manuální faktura
        </Button>
      </div>

      {/* Statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Celkové tržby</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalRevenue.toLocaleString('cs-CZ')} Kč
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zaplacené faktury</p>
                <p className="text-3xl font-bold text-blue-600">{paidInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nezaplacené faktury</p>
                <p className="text-3xl font-bold text-orange-600">{unpaidInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graf měsíčních tržeb */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Měsíční tržby
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString('cs-CZ')} Kč`} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  fill="#931e31" 
                  name="Tržby (Kč)"
                  cursor="pointer"
                  onClick={(data: any) => setSelectedMonth(data.month)}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">Zatím žádné tržby</p>
          )}
          {selectedMonth && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-blue-900">
                  Zobrazuji faktury za: {selectedMonth}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedMonth(null)}
                >
                  Zrušit filtr
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seznam faktur */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedMonth ? `Faktury za ${selectedMonth}` : 'Všechny faktury'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getFilteredInvoices().length === 0 ? (
            <p className="text-center text-gray-500 py-8">Žádné faktury</p>
          ) : (
            <div className="space-y-4">
              {getFilteredInvoices().map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-4 border-2 rounded-xl hover:border-[#931e31] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#931e31]">
                          {invoice.invoiceNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                          {invoice.type === 'automatic' ? 'Automatická' : 'Manuální'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Zákazník</p>
                          <p className="font-bold">{invoice.customerName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Částka</p>
                          <p className="font-bold">{invoice.totalAmount.toLocaleString('cs-CZ')} Kč</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Vystaveno</p>
                          <p className="font-bold">
                            {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Splatnost</p>
                          <p className="font-bold">
                            {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Zobrazit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice)}
                        className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

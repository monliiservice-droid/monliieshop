'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, CheckCircle, XCircle, Package, Truck, Home, X } from 'lucide-react'
import { format } from 'date-fns'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: string
  totalAmount: number
  status: string
  paymentStatus: string
  trackingNumber: string | null
  createdAt: string
  items: any[]
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  in_production: 'bg-purple-500',
  ready_to_ship: 'bg-yellow-500',
  shipped: 'bg-orange-500',
  delivered: 'bg-green-700',
  cancelled: 'bg-gray-500',
}

const statusLabels: Record<string, string> = {
  new: 'Nová objednávka',
  accepted: 'Přijato',
  rejected: 'Odmítnuto',
  in_production: 'Ve výrobě',
  ready_to_ship: 'Připraveno k odeslání',
  shipped: 'Odesláno',
  delivered: 'Doručeno',
  cancelled: 'Zrušeno',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        alert(`Stav objednávky byl změněn na: ${statusLabels[newStatus]}`)
        await fetchOrders()
        if (selectedOrder && selectedOrder.id === orderId) {
          const updated = await res.json()
          setSelectedOrder(updated)
        }
      } else {
        alert('Chyba při změně stavu objednávky')
      }
    } catch (error) {
      console.error('Error changing status:', error)
      alert('Chyba při změně stavu objednávky')
    }
  }

  const getAvailableActions = (status: string) => {
    switch (status) {
      case 'new':
        return [
          { status: 'accepted', label: 'Přijmout', icon: CheckCircle, color: 'bg-green-600' },
          { status: 'rejected', label: 'Odmítnout', icon: XCircle, color: 'bg-red-600' },
        ]
      case 'accepted':
        return [
          { status: 'in_production', label: 'Ve výrobě', icon: Package, color: 'bg-purple-600' },
        ]
      case 'in_production':
        return [
          { status: 'ready_to_ship', label: 'Připraveno', icon: CheckCircle, color: 'bg-yellow-600' },
        ]
      case 'ready_to_ship':
        return [
          { status: 'shipped', label: 'Odeslat', icon: Truck, color: 'bg-orange-600' },
        ]
      case 'shipped':
        return [
          { status: 'delivered', label: 'Doručeno', icon: Home, color: 'bg-green-700' },
        ]
      default:
        return []
    }
  }

  if (loading) {
    return <div className="p-8">Načítání...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Objednávky</h1>
        <p className="text-gray-600">Spravujte objednávky zákazníků</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Všechny objednávky ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Zatím nemáte žádné objednávky.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Číslo objednávky</TableHead>
                  <TableHead>Zákazník</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Celkem</TableHead>
                  <TableHead>Platba</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{order.totalAmount} Kč</TableCell>
                    <TableCell>
                      <Badge className={order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {order.paymentStatus === 'paid' ? 'Zaplaceno' : 'Čeká'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowDetail(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal pro detail objednávky */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Objednávka {selectedOrder.orderNumber}</h2>
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
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Aktuální stav:</p>
                    <Badge className={`${statusColors[selectedOrder.status]} text-white px-4 py-2 text-base`}>
                      {statusLabels[selectedOrder.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Platba:</p>
                    <Badge className={selectedOrder.paymentStatus === 'paid' ? 'bg-green-500 text-white px-4 py-2' : 'bg-yellow-500 text-white px-4 py-2'}>
                      {selectedOrder.paymentStatus === 'paid' ? 'Zaplaceno' : 'Čeká na platbu'}
                    </Badge>
                  </div>
                </div>

                {/* Akční tlačítka */}
                <div className="flex flex-wrap gap-2">
                  {getAvailableActions(selectedOrder.status).map((action) => (
                    <Button
                      key={action.status}
                      onClick={() => handleStatusChange(selectedOrder.id, action.status)}
                      className={`${action.color} hover:opacity-90 text-white`}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Údaje zákazníka */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Údaje zákazníka</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Jméno</p>
                    <p className="font-semibold">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold">{selectedOrder.customerEmail}</p>
                  </div>
                  {selectedOrder.customerPhone && (
                    <div>
                      <p className="text-gray-600">Telefon</p>
                      <p className="font-semibold">{selectedOrder.customerPhone}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-gray-600">Doručovací adresa</p>
                    <p className="font-semibold">
                      {(() => {
                        try {
                          const addr = JSON.parse(selectedOrder.shippingAddress)
                          return `${addr.street}, ${addr.zip} ${addr.city}`
                        } catch {
                          return selectedOrder.shippingAddress
                        }
                      })()}
                    </p>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Sledovací číslo</p>
                      <p className="font-semibold">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Položky objednávky */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Položky objednávky</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Produkt</th>
                        <th className="text-right p-3 font-semibold">Množství</th>
                        <th className="text-right p-3 font-semibold">Cena/ks</th>
                        <th className="text-right p-3 font-semibold">Celkem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">
                            <div>
                              <p className="font-semibold">{item.product?.name || 'Produkt'}</p>
                              {item.variant && (
                                <p className="text-sm text-gray-500">
                                  {(() => {
                                    try {
                                      const variant = JSON.parse(item.variant)
                                      return Object.entries(variant).map(([key, value]) => `${key}: ${value}`).join(', ')
                                    } catch {
                                      return item.variant
                                    }
                                  })()}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="text-right p-3">{item.quantity}</td>
                          <td className="text-right p-3">{item.price.toLocaleString('cs-CZ')} Kč</td>
                          <td className="text-right p-3 font-semibold">
                            {(item.quantity * item.price).toLocaleString('cs-CZ')} Kč
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Celkem:</span>
                    <span className="text-[#931e31]">{selectedOrder.totalAmount.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                </div>
              </div>

              {/* Datum vytvoření */}
              <div className="text-sm text-gray-600">
                <p>Vytvořeno: {format(new Date(selectedOrder.createdAt), 'dd.MM.yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

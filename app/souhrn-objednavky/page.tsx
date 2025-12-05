'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, CreditCard, MapPin, ArrowLeft, CheckCircle, Truck, Building2, User } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderSummaryPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem('orderData')
    if (!data) {
      router.push('/checkout')
      return
    }
    setOrderData(JSON.parse(data))
  }, [router])

  const handleSubmitOrder = async () => {
    if (!orderData) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Vymazání košíku a session dat
        localStorage.removeItem('cart')
        sessionStorage.removeItem('orderData')
        window.dispatchEvent(new Event('cartUpdated'))
        
        // Přesměrování na děkovnou stránku
        alert(`Děkujeme za objednávku! Číslo objednávky: ${result.order.orderNumber}\n\nBrzy vás budeme kontaktovat s potvrzením.`)
        router.push('/')
      } else {
        throw new Error(result.message || 'Chyba při vytváření objednávky')
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Chyba při odesílání objednávky. Zkuste to prosím znovu nebo nás kontaktujte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!orderData) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p>Načítání...</p>
        </main>
        <Footer />
      </>
    )
  }

  const getShippingMethodName = (method: string) => {
    switch (method) {
      case 'zasilkovna_pickup':
        return 'Zásilkovna - Výdejní místo'
      case 'zasilkovna_home':
        return 'Zásilkovna - Doručení domů'
      case 'personal':
        return 'Osobní odběr'
      default:
        return method
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'card':
        return 'Platební karta (GoPay)'
      case 'transfer':
        return 'Bankovní převod'
      case 'cod':
        return 'Dobírka'
      default:
        return method
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/10 to-white">
        <section className="py-16">
          <div className="container max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <Link href="/checkout">
                <Button variant="ghost" className="mb-6 group">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Zpět na doprava a platba
                </Button>
              </Link>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight animate-fade-in">Souhrn objednávky</h1>
              <p className="text-xl text-gray-600 animate-fade-in" style={{animationDelay: '0.1s'}}>
                Zkontrolujte všechny údaje před odesláním
              </p>
            </div>

            <div className="space-y-6">
              {/* Kontaktní údaje */}
              <Card className="border-0 rounded-3xl soft-shadow-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <User className="h-6 w-6 text-[#931e31]" />
                    {orderData.customer.isCompany ? 'Fakturační údaje' : 'Kontaktní údaje'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Jméno a příjmení</p>
                      <p className="font-semibold">{orderData.customer.firstName} {orderData.customer.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{orderData.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telefon</p>
                      <p className="font-semibold">{orderData.customer.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Adresa</p>
                      <p className="font-semibold">{orderData.customer.address}, {orderData.customer.zip} {orderData.customer.city}</p>
                    </div>
                  </div>
                  
                  {orderData.customer.isCompany && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-5 w-5 text-[#931e31]" />
                        <p className="font-semibold">Firemní údaje</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Název firmy</p>
                          <p className="font-semibold">{orderData.customer.company}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">IČO</p>
                          <p className="font-semibold">{orderData.customer.ico}</p>
                        </div>
                        {orderData.customer.dic && (
                          <div>
                            <p className="text-sm text-gray-600">DIČ</p>
                            <p className="font-semibold">{orderData.customer.dic}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Doprava */}
              <Card className="border-0 rounded-3xl soft-shadow-lg animate-fade-in" style={{animationDelay: '0.3s'}}>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Truck className="h-6 w-6 text-[#931e31]" />
                    Způsob dopravy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{getShippingMethodName(orderData.shipping.method)}</p>
                      {orderData.shipping.method === 'zasilkovna_pickup' && orderData.shipping.pickupPoint && (
                        <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-sm font-medium text-green-800">Výdejní místo:</p>
                          <p className="text-sm text-green-700">{orderData.shipping.pickupPoint.name}</p>
                          <p className="text-xs text-green-600">{orderData.shipping.pickupPoint.street}, {orderData.shipping.pickupPoint.city}</p>
                        </div>
                      )}
                      {orderData.shipping.method === 'personal' && orderData.shipping.personalLocation && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-sm font-medium text-blue-800">Místo odběru:</p>
                          <p className="text-sm text-blue-700">
                            {orderData.shipping.personalLocation === 'havirov' ? 'Havířov' : 'Frenštát pod Radhoštěm'}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xl font-bold text-[#931e31]">
                      {orderData.shipping.price === 0 ? 'Zdarma' : `${orderData.shipping.price} Kč`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Platba */}
              <Card className="border-0 rounded-3xl soft-shadow-lg animate-fade-in" style={{animationDelay: '0.4s'}}>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-[#931e31]" />
                    Způsob platby
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">{getPaymentMethodName(orderData.payment.method)}</p>
                    {orderData.payment.fee > 0 && (
                      <p className="text-xl font-bold text-[#931e31]">+{orderData.payment.fee} Kč</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Položky objednávky */}
              <Card className="border-0 rounded-3xl soft-shadow-lg animate-fade-in" style={{animationDelay: '0.5s'}}>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Package className="h-6 w-6 text-[#931e31]" />
                    Položky objednávky
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        {item.variant && (
                          <p className="text-sm text-gray-600">{item.variant.value}</p>
                        )}
                        <p className="text-sm text-gray-500">Počet: {item.quantity || 1} ks</p>
                      </div>
                      <p className="text-lg font-bold text-[#931e31]">
                        {(item.price * (item.quantity || 1)).toFixed(0)} Kč
                      </p>
                    </div>
                  ))}
                  
                  <div className="pt-4 space-y-2 border-t-2 border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mezisoučet:</span>
                      <span className="font-semibold">
                        {orderData.items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0).toFixed(0)} Kč
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Doprava:</span>
                      <span className="font-semibold">
                        {orderData.shipping.price === 0 ? 'Zdarma' : `${orderData.shipping.price} Kč`}
                      </span>
                    </div>
                    {orderData.payment.fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Poplatek za dobírku:</span>
                        <span className="font-semibold">+{orderData.payment.fee} Kč</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-gray-200">
                      <span className="text-2xl font-bold">Celkem k úhradě:</span>
                      <span className="text-4xl font-bold bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                        {orderData.totalPrice} Kč
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tlačítko objednat */}
              <Card className="border-2 border-[#931e31] bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl overflow-hidden soft-shadow-xl animate-fade-in" style={{animationDelay: '0.6s'}}>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p>
                        Odesláním objednávky s povinností platby souhlasíte s našimi{' '}
                        <Link href="/obchodni-podminky" className="text-[#931e31] underline hover:text-[#b8263d]">
                          obchodními podmínkami
                        </Link>
                        {' '}a{' '}
                        <Link href="/ochrana-osobnich-udaju" className="text-[#931e31] underline hover:text-[#b8263d]">
                          zásadami ochrany osobních údajů
                        </Link>.
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white py-8 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-pulse">Odesílám objednávku...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-3 h-6 w-6" />
                          Odeslat objednávku s povinností platby
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-gray-600">
                      ✨ Po odeslání vám přijde potvrzovací email s číslem objednávky
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

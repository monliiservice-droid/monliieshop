'use client'

import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, CreditCard, ArrowLeft, ArrowRight, MapPin, Truck, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { ZASILKOVNA_CONFIG, type ZBoxPoint } from '@/lib/zasilkovna-zbox'

interface CartItem {
  id: string
  name: string
  price: number
  quantity?: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [shippingMethod, setShippingMethod] = useState('zbox')
  const [paymentMethod, setPaymentMethod] = useState('qr_code')
  const [isCompany, setIsCompany] = useState(false)
  const [personalPickupLocation, setPersonalPickupLocation] = useState<'havirov' | 'frenstat' | null>(null)
  const [nearestZBox, setNearestZBox] = useState<ZBoxPoint | null>(null)
  const [isLoadingZBox, setIsLoadingZBox] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    company: '',
    ico: '',
    dic: ''
  })

  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = localStorage.getItem('cart')
        if (cart) {
          const parsedCart = JSON.parse(cart)
          setCartItems(parsedCart)
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadCart()
  }, [])

  // Auto-find nearest Z-BOX when address is complete
  useEffect(() => {
    const findZBox = async () => {
      if (
        shippingMethod === 'zbox' &&
        formData.address &&
        formData.city &&
        formData.zip &&
        formData.address.length > 3 &&
        formData.city.length > 2 &&
        formData.zip.length >= 5
      ) {
        setIsLoadingZBox(true)
        try {
          const response = await fetch('/api/zasilkovna/nearest-zbox', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              street: formData.address,
              city: formData.city,
              zip: formData.zip,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.zbox) {
              setNearestZBox(data.zbox)
            }
          }
        } catch (error) {
          console.error('Error finding Z-BOX:', error)
        } finally {
          setIsLoadingZBox(false)
        }
      }
    }

    // Debounce the search
    const timeoutId = setTimeout(findZBox, 1000)
    return () => clearTimeout(timeoutId)
  }, [formData.address, formData.city, formData.zip, shippingMethod])


  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 1
      return total + (item.price * quantity)
    }, 0)
  }

  const getShippingPrice = () => {
    const total = getTotalPrice()
    
    switch (shippingMethod) {
      case 'zbox':
        // Free shipping over threshold
        if (total >= ZASILKOVNA_CONFIG.freeShippingThreshold) {
          return 0
        }
        return ZASILKOVNA_CONFIG.zboxDeliveryPrice
      case 'personal':
        return 0
      default:
        return 0
    }
  }

  const getFinalPrice = () => {
    return getTotalPrice() + getShippingPrice()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validace Z-BOX
    if (shippingMethod === 'zbox' && !nearestZBox) {
      alert('Nejbližší Z-BOX nebyl nalezen. Prosím zkontrolujte vaši adresu.')
      return
    }
    
    // Validace místa osobního odběru
    if (shippingMethod === 'personal' && !personalPickupLocation) {
      alert('Prosím vyberte místo osobního odběru (Havířov nebo Frenštát)')
      return
    }
    
    // Validace firemních údajů
    if (isCompany && (!formData.company || !formData.ico)) {
      alert('Prosím vyplňte všechny povinné firemní údaje')
      return
    }
    
    // Sestavení dat objednávky
    const orderData = {
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        isCompany,
        ...(isCompany && {
          company: formData.company,
          ico: formData.ico,
          dic: formData.dic
        })
      },
      shipping: {
        method: shippingMethod,
        price: getShippingPrice(),
        ...(shippingMethod === 'zbox' && nearestZBox && {
          zbox: nearestZBox
        }),
        ...(shippingMethod === 'personal' && personalPickupLocation && {
          personalLocation: personalPickupLocation
        })
      },
      payment: {
        method: paymentMethod,
        fee: paymentMethod === 'cod' ? 30 : 0
      },
      items: cartItems,
      totalPrice: getFinalPrice() + (paymentMethod === 'cod' ? 30 : 0)
    }
    
    // Uložení dat do sessionStorage
    sessionStorage.setItem('orderData', JSON.stringify(orderData))
    
    // Přesměrování na souhrn objednávky
    router.push('/souhrn-objednavky')
  }

  if (!isLoaded) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center">
          <p>Načítání...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (cartItems.length === 0) {
    router.push('/kosik')
    return null
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/10 to-white">
        <section className="py-16">
          <div className="container max-w-6xl">
            {/* Header */}
            <div className="mb-12">
              <Link href="/kosik">
                <Button variant="ghost" className="mb-6 group">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Zpět do košíku
                </Button>
              </Link>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight animate-fade-in">Platba a doprava</h1>
              <p className="text-xl text-gray-600 animate-fade-in" style={{animationDelay: '0.1s'}}>
                Vyberte způsob dopravy a platby
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Kontaktní a fakturační údaje */}
                <Card className="border-0 rounded-3xl soft-shadow-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-[#931e31]" />
                      Fakturační údaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Checkbox nakupuji na firmu */}
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
                      <input
                        type="checkbox"
                        id="isCompany"
                        checked={isCompany}
                        onChange={(e) => setIsCompany(e.target.checked)}
                        className="w-5 h-5 text-[#931e31] rounded focus:ring-[#931e31]"
                      />
                      <label htmlFor="isCompany" className="flex items-center gap-2 cursor-pointer font-medium">
                        <Building2 className="h-5 w-5 text-[#931e31]" />
                        Nakupuji na firmu
                      </label>
                    </div>

                    {/* Firemní údaje */}
                    {isCompany && (
                      <div className="space-y-4 p-4 bg-blue-50 rounded-2xl border border-blue-200 animate-fade-in">
                        <div>
                          <Label htmlFor="company">Název firmy *</Label>
                          <Input
                            id="company"
                            required={isCompany}
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="mt-2 rounded-xl"
                            placeholder="např. ACME s.r.o."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="ico">IČO *</Label>
                            <Input
                              id="ico"
                              required={isCompany}
                              value={formData.ico}
                              onChange={(e) => setFormData({...formData, ico: e.target.value})}
                              className="mt-2 rounded-xl"
                              placeholder="12345678"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dic">DIČ</Label>
                            <Input
                              id="dic"
                              value={formData.dic}
                              onChange={(e) => setFormData({...formData, dic: e.target.value})}
                              className="mt-2 rounded-xl"
                              placeholder="CZ12345678"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Kontaktní údaje */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Jméno *</Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="mt-2 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Příjmení *</Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="mt-2 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-2 rounded-xl"
                        placeholder="vas@email.cz"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="mt-2 rounded-xl"
                        placeholder="+420 123 456 789"
                      />
                    </div>

                    {/* Fakturační adresa */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-semibold mb-4 text-lg">Fakturační adresa</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address">Ulice a číslo popisné *</Label>
                          <Input
                            id="address"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="mt-2 rounded-xl"
                            placeholder="Hlavní 123"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">Město *</Label>
                            <Input
                              id="city"
                              required
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                              className="mt-2 rounded-xl"
                              placeholder="Praha"
                            />
                          </div>
                          <div>
                            <Label htmlFor="zip">PSČ *</Label>
                            <Input
                              id="zip"
                              required
                              value={formData.zip}
                              onChange={(e) => setFormData({...formData, zip: e.target.value})}
                              className="mt-2 rounded-xl"
                              placeholder="110 00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
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
                  <CardContent className="space-y-4">
                    {/* Zásilkovna Z-BOX */}
                    <div 
                      onClick={() => setShippingMethod('zbox')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        shippingMethod === 'zbox' 
                          ? 'border-[#931e31] bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            shippingMethod === 'zbox' ? 'border-[#931e31]' : 'border-gray-300'
                          }`}>
                            {shippingMethod === 'zbox' && (
                              <div className="w-3 h-3 rounded-full bg-[#931e31]"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">Zásilkovna Z-BOX</h3>
                            <p className="text-sm text-gray-600">Automatický výdejní box nejblíže vaší adrese</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#931e31]">
                          {getTotalPrice() >= ZASILKOVNA_CONFIG.freeShippingThreshold ? 'ZDARMA' : `${ZASILKOVNA_CONFIG.zboxDeliveryPrice} Kč`}
                        </span>
                      </div>

                      {/* Nearest Z-BOX Display */}
                      {shippingMethod === 'zbox' && (
                        <div className="mt-3 pt-3 border-t border-pink-200">
                          {isLoadingZBox ? (
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                              <p className="text-sm text-blue-700">🔍 Hledám nejbližší Z-BOX...</p>
                            </div>
                          ) : nearestZBox ? (
                            <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                              <p className="text-sm font-medium text-green-800">✓ Nejbližší Z-BOX:</p>
                              <p className="text-sm font-semibold text-green-900 mt-1">{nearestZBox.name}</p>
                              <p className="text-xs text-green-700">{nearestZBox.street}</p>
                              <p className="text-xs text-green-700">{nearestZBox.city}, {nearestZBox.zip}</p>
                            </div>
                          ) : (
                            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                              <p className="text-sm text-yellow-800">
                                ℹ️ Vyplňte vaši adresu výše a automaticky najdeme nejbližší Z-BOX
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Osobní odběr */}
                    <div 
                      onClick={() => setShippingMethod('personal')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        shippingMethod === 'personal' 
                          ? 'border-[#931e31] bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            shippingMethod === 'personal' ? 'border-[#931e31]' : 'border-gray-300'
                          }`}>
                            {shippingMethod === 'personal' && (
                              <div className="w-3 h-3 rounded-full bg-[#931e31]"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">Osobní odběr</h3>
                            <p className="text-sm text-gray-600">Vyberte si místo odběru</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">Zdarma</span>
                      </div>

                      {/* Výběr místa osobního odběru */}
                      {shippingMethod === 'personal' && (
                        <div className="mt-3 pt-3 border-t border-pink-200">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Vyberte místo odběru:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                setPersonalPickupLocation('havirov')
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                personalPickupLocation === 'havirov'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                  personalPickupLocation === 'havirov' ? 'border-green-500' : 'border-gray-300'
                                }`}>
                                  {personalPickupLocation === 'havirov' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">Havířov</p>
                                  <p className="text-xs text-gray-600 mt-1">Hlavní 1234</p>
                                  <p className="text-xs text-gray-600">736 01 Havířov</p>
                                </div>
                              </div>
                            </div>

                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                setPersonalPickupLocation('frenstat')
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                personalPickupLocation === 'frenstat'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                  personalPickupLocation === 'frenstat' ? 'border-green-500' : 'border-gray-300'
                                }`}>
                                  {personalPickupLocation === 'frenstat' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">Frenštát pod Radhoštěm</p>
                                  <p className="text-xs text-gray-600 mt-1">Hlavní 5678</p>
                                  <p className="text-xs text-gray-600">744 01 Frenštát p. R.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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
                  <CardContent className="space-y-3">
                    <div 
                      onClick={() => setPaymentMethod('qr_code')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        paymentMethod === 'qr_code' 
                          ? 'border-[#931e31] bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'qr_code' ? 'border-[#931e31]' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'qr_code' && (
                            <div className="w-3 h-3 rounded-full bg-[#931e31]"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">QR platba</h3>
                          <p className="text-sm text-gray-600">Bankovní převod pomocí QR kódu</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        paymentMethod === 'cod' 
                          ? 'border-[#931e31] bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'cod' ? 'border-[#931e31]' : 'border-gray-300'
                          }`}>
                            {paymentMethod === 'cod' && (
                              <div className="w-3 h-3 rounded-full bg-[#931e31]"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">Dobírka</h3>
                            <p className="text-sm text-gray-600">Platba při převzetí</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">+30 Kč</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:sticky lg:top-24 h-fit">
                <Card className="border-0 rounded-3xl overflow-hidden soft-shadow-xl animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <CardHeader className="bg-gradient-to-r from-[#931e31] to-[#b8263d] text-white p-8">
                    <CardTitle className="text-2xl font-bold">Souhrn objednávky</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          {item.name} <strong>×{item.quantity || 1}</strong>
                        </span>
                        <span className="font-semibold">{(item.price * (item.quantity || 1)).toFixed(0)} Kč</span>
                      </div>
                    ))}
                    
                    <div className="pt-4 space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Mezisoučet:</span>
                        <span className="font-bold">{getTotalPrice()} Kč</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Doprava:</span>
                        <span className="font-bold text-green-600">
                          {getShippingPrice() === 0 ? 'Zdarma' : `${getShippingPrice()} Kč`}
                        </span>
                      </div>
                      {paymentMethod === 'cod' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dobírka:</span>
                          <span className="font-semibold">+30 Kč</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-2xl font-bold">Celkem:</span>
                        <div className="text-4xl font-bold bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                          {getFinalPrice() + (paymentMethod === 'cod' ? 30 : 0)} Kč
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        disabled={shippingMethod === 'zbox' && !nearestZBox}
                        className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white py-7 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {shippingMethod === 'zbox' && !nearestZBox ? (
                          <>
                            <MapPin className="mr-2 h-5 w-5" />
                            Vyplňte vaši adresu pro nalezení Z-BOXu
                          </>
                        ) : (
                          <>
                            Pokračovat na souhrn
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                      {shippingMethod === 'zbox' && !nearestZBox && (
                        <p className="text-xs text-red-500 text-center mt-2">
                          ⚠️ Pro dokončení objednávky vyplňte vaši adresu
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Trash2, ArrowRight, Plus, Minus, Package, Truck, Tag, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface CartItem {
  id: string
  productId?: string
  type?: string
  plan?: number
  braType?: string
  withGarters?: boolean
  measurements?: any
  price: number
  name: string
  quantity?: number
  variant?: {
    id: string
    name: string
    value: string
  } | null
  image?: string | null
  addedAt?: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [discountError, setDiscountError] = useState('')
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)

  useEffect(() => {
    // Načtení košíku z localStorage
    const loadCart = () => {
      try {
        const cart = localStorage.getItem('cart')
        if (cart) {
          const parsedCart = JSON.parse(cart)
          setCartItems(parsedCart)
          console.log('Cart loaded:', parsedCart)
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadCart()
  }, [])

  const removeFromCart = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 1
      return total + (item.price * quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
  }

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0
    const subtotal = getTotalPrice()
    
    if (appliedDiscount.type === 'percentage') {
      return Math.round(subtotal * (appliedDiscount.value / 100))
    } else {
      return appliedDiscount.value
    }
  }

  const getFinalPrice = () => {
    const subtotal = getTotalPrice()
    const discount = getDiscountAmount()
    return Math.max(0, subtotal - discount)
  }

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Zadejte slevový kód')
      return
    }

    setIsApplyingDiscount(true)
    setDiscountError('')

    try {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: discountCode.trim().toUpperCase(),
          orderAmount: getTotalPrice()
        })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setAppliedDiscount(data.discount)
        setDiscountError('')
      } else {
        setDiscountError(data.message || 'Neplatný slevový kód')
        setAppliedDiscount(null)
      }
    } catch (error) {
      setDiscountError('Chyba při ověřování kódu')
      setAppliedDiscount(null)
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    setDiscountError('')
  }

  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p>Načítání košíku...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-pink-50/10 to-white">
        <section className="py-16">
          <div className="container max-w-7xl">
            <div className="mb-16 text-center">
              <div className="inline-block animate-fade-in mb-6">
                <div className="relative">
                  <div className="bg-gradient-to-r from-[#931e31] to-[#b8263d] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:rotate-3 transition-transform duration-300">
                    <ShoppingBag className="h-10 w-10 text-white" />
                  </div>
                  {cartItems.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-white border-4 border-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                      <span className="text-[#931e31] font-black text-sm">{getTotalItems()}</span>
                    </div>
                  )}
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight animate-fade-in bg-gradient-to-r from-gray-900 via-[#931e31] to-gray-900 bg-clip-text text-transparent" style={{animationDelay: '0.1s'}}>
                Nákupní košík
              </h1>
            </div>

            {cartItems.length === 0 ? (
              <Card className="border-0 rounded-3xl p-16 text-center animate-fade-in soft-shadow-xl bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30">
                <div className="flex flex-col items-center space-y-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
                      <ShoppingBag className="h-16 w-16 text-[#931e31]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">0</div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">Váš košík je prázdný</h2>
                    <p className="text-gray-600 text-lg mb-8">
                      Objevte naši kolekci luxusního prádla
                    </p>
                  </div>
                  <Link href="/obchod">
                    <Button className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-10 py-7 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group">
                      Začít nakupovat
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-5">
                  {cartItems.map((item, index) => (
                    <Card key={item.id} className="border-0 rounded-3xl soft-shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in group bg-white" style={{animationDelay: `${index * 0.1}s`}}>
                      <CardContent className="p-0">
                        <div className="flex gap-0">
                          {/* Obrázek produktu */}
                          {item.image && (
                            <div className="flex-shrink-0 w-36 lg:w-48 h-full bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 overflow-hidden relative group">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                          )}
                          
                          {/* Informace o produktu */}
                          <div className="flex-1 p-6 lg:p-8">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h3 className="text-2xl lg:text-3xl font-bold mb-3 group-hover:text-[#931e31] transition-colors duration-300">{item.name}</h3>
                                
                                {/* Varianta (velikost) */}
                                {item.variant && (
                                  <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border-2 border-pink-200 shadow-sm">
                                    <span className="text-sm font-semibold text-gray-700">{item.variant.name}:</span>
                                    <span className="text-sm font-bold text-[#931e31]">{item.variant.value}</span>
                                  </div>
                                )}
                                
                                {/* Předplatné - měření */}
                                {item.type === 'subscription' && item.measurements && (
                                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-2xl border border-pink-200/50 mb-4 shadow-sm">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Vaše míry</h4>
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#931e31]"></span>
                                        <span className="text-gray-600">Podprsenka:</span>
                                        <strong className="text-gray-900">{item.measurements.size}</strong>
                                      </div>
                                      {item.measurements.group && (
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-[#931e31]"></span>
                                          <span className="text-gray-600">Košíček:</span>
                                          <strong className="text-gray-900">{item.measurements.group}</strong>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#931e31]"></span>
                                        <span className="text-gray-600">Kalhotky:</span>
                                        <strong className="text-gray-900">{item.measurements.pantiesSize}</strong>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Odstranit tlačítko - vpravo nahoře */}
                              <Button
                                onClick={() => removeFromCart(item.id)}
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 ml-4"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                            
                            {/* Spodní část - cena a množství */}
                            <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-6">
                                {/* Ovládání množství */}
                                {item.type !== 'subscription' && (
                                  <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Množství</span>
                                    <div className="flex items-center border-2 border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-[#931e31] transition-colors">
                                      <button
                                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                        className="p-3 hover:bg-pink-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={(item.quantity || 1) <= 1}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="px-6 font-bold text-lg">{item.quantity || 1}</span>
                                      <button
                                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                        className="p-3 hover:bg-pink-50 transition-colors"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Cena za kus */}
                                <div className="flex flex-col gap-2">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cena / ks</span>
                                  <span className="text-lg font-bold text-gray-700">{item.price} Kč</span>
                                </div>
                              </div>
                              
                              {/* Celková cena */}
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Celkem</span>
                                <p className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#931e31] via-[#b8263d] to-[#931e31] bg-clip-text text-transparent">
                                  {(item.price * (item.quantity || 1)).toFixed(0)} Kč
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary */}
                <div className="lg:sticky lg:top-24 space-y-6">
                  <Card className="border-0 rounded-3xl overflow-hidden soft-shadow-xl animate-fade-in hover:shadow-2xl transition-shadow duration-500" style={{animationDelay: '0.3s'}}>
                    <div className="bg-gradient-to-br from-[#931e31] via-[#b8263d] to-[#931e31] p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                      <CardTitle className="text-3xl font-black text-white relative z-10">Souhrn objednávky</CardTitle>
                    </div>
                    <CardContent className="p-8 bg-gradient-to-b from-white to-pink-50/20">
                      <div className="space-y-8">
                        {/* Počet položek */}
                        <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                              <Package className="h-5 w-5 text-[#931e31]" />
                            </div>
                            <span className="text-gray-600 font-medium">Položek v košíku</span>
                          </div>
                          <span className="font-black text-3xl text-[#931e31]">{getTotalItems()}</span>
                        </div>

                        {/* Slevový kód */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Tag className="h-5 w-5 text-[#931e31]" />
                            <h3 className="font-semibold text-gray-900">Slevový kód</h3>
                          </div>
                          
                          {appliedDiscount ? (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-green-900 text-lg">{appliedDiscount.code}</p>
                                  <p className="text-sm text-green-700">
                                    Sleva {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `${appliedDiscount.value} Kč`}
                                  </p>
                                </div>
                                <Button
                                  onClick={removeDiscount}
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-900 hover:text-red-500 hover:bg-red-50"
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder="Zadejte slevový kód"
                                  value={discountCode}
                                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                  onKeyPress={(e) => e.key === 'Enter' && applyDiscountCode()}
                                  className="rounded-xl"
                                />
                                <Button
                                  onClick={applyDiscountCode}
                                  disabled={isApplyingDiscount || !discountCode.trim()}
                                  className="bg-[#931e31] hover:bg-[#6b1623] text-white px-6 rounded-xl"
                                >
                                  {isApplyingDiscount ? 'Ověřuji...' : 'Použít'}
                                </Button>
                              </div>
                              {discountError && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                  <X className="h-3 w-3" />
                                  {discountError}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Cena */}
                        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-3xl border-2 border-pink-200/50 shadow-inner">
                          <div className="space-y-3">
                            <div className="flex justify-between text-lg">
                              <span className="text-gray-600">Mezisoučet:</span>
                              <span className="font-bold">{getTotalPrice()} Kč</span>
                            </div>
                            
                            {appliedDiscount && (
                              <div className="flex justify-between text-lg text-green-600">
                                <span className="font-medium">Sleva:</span>
                                <span className="font-bold">-{getDiscountAmount()} Kč</span>
                              </div>
                            )}
                            
                            <div className="border-t-2 border-dashed border-pink-200 pt-3">
                              <div className="flex justify-between items-baseline">
                                <span className="text-2xl font-bold text-gray-900">K úhradě:</span>
                                <div className="text-right">
                                  <div className="text-5xl font-black bg-gradient-to-r from-[#931e31] via-[#b8263d] to-[#931e31] bg-clip-text text-transparent">
                                    {getFinalPrice()}
                                  </div>
                                  <span className="text-3xl font-black text-gray-400">Kč</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            {getFinalPrice() >= 2500 ? '🎉 Doprava ZDARMA na výdejní místo!' : 'Doprava bude vypočtena v dalším kroku'}
                          </p>
                        </div>

                        {/* Tlačítka */}
                        <div className="space-y-3">
                          <Link href="/checkout" className="block">
                            <Button className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white py-7 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl group relative overflow-hidden">
                              <span className="relative z-10 flex items-center justify-center">
                                Pokračovat na platbu
                                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </Button>
                          </Link>
                          <Link href="/obchod" className="block">
                            <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#931e31] hover:text-[#931e31] hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-2xl py-5 transition-all duration-300 font-semibold">
                              Pokračovat v nákupu
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bezpečnost a výhody */}
                  <div className="space-y-3 animate-fade-in" style={{animationDelay: '0.4s'}}>
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white text-xl font-bold">✓</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-green-900 mb-1">Bezpečné platby</h4>
                          <p className="text-sm text-green-700">Šifrované spojení SSL</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Truck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-900 mb-1">Rychlé doručení</h4>
                          <p className="text-sm text-blue-700">Do 2-3 pracovních dnů</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

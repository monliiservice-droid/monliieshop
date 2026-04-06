'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Gift, Package, Heart, Sparkles, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function PredplatnePage() {
  const [selectedPlan, setSelectedPlan] = useState<3 | 6 | 12 | null>(null)
  const [withGarters, setWithGarters] = useState<boolean>(false)
  const [braType, setBraType] = useState<'wired' | 'bralette'>('wired')
  const [measurements, setMeasurements] = useState({
    size: '',
    group: '',
    pantiesSize: ''
  })
  const [showToast, setShowToast] = useState(false)

  const scrollToForm = () => {
    setTimeout(() => {
      const formElement = document.getElementById('measurement-form')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const scrollToPackages = () => {
    setTimeout(() => {
      const packagesElement = document.getElementById('packages-section')
      if (packagesElement) {
        packagesElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('handleAddToCart called')
    console.log('Measurements:', measurements)
    
    // Validace - u braletky není potřeba košíček
    if (braType === 'wired') {
      if (!measurements.size || !measurements.group || !measurements.pantiesSize) {
        alert('Prosím vyplňte všechny rozměry')
        return
      }
    } else {
      if (!measurements.size || !measurements.pantiesSize) {
        alert('Prosím vyplňte všechny rozměry')
        return
      }
    }

    // Příprava dat
    const cartItem = {
      id: Date.now().toString(),
      type: 'subscription',
      plan: selectedPlan,
      braType: braType,
      withGarters: withGarters,
      measurements: measurements,
      price: getPrice(selectedPlan!),
      name: `Předplatné ${selectedPlan} měsíců - ${braType === 'wired' ? 'S kosticemi' : 'Braletková'} ${withGarters ? 'S podvazky' : 'Bez podvazků'}`,
      addedAt: new Date().toISOString()
    }

    console.log('Cart item:', cartItem)

    try {
      // Uložení do localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
      existingCart.push(cartItem)
      localStorage.setItem('cart', JSON.stringify(existingCart))
      
      console.log('Cart updated:', existingCart)

      // Dispatchnout custom event pro aktualizaci navbar
      window.dispatchEvent(new Event('cartUpdated'))

      // Zobrazení toast notifikace
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      
      // Reset formuláře
      setSelectedPlan(null)
      setMeasurements({ size: '', group: '', pantiesSize: '' })
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Chyba při přidávání do košíku. Zkuste to prosím znovu.')
    }
  }

  const prices = {
    wired: {
      without: { 3: 3300, 6: 6600, 12: 13200 },
      with: { 3: 4200, 6: 8400, 12: 16800 }
    },
    bralette: {
      without: { 3: 2800, 6: 5600, 12: 11200 },
      with: { 3: 3700, 6: 7400, 12: 14800 }
    }
  }

  const getPrice = (months: 3 | 6 | 12) => {
    const priceTable = braType === 'wired' ? prices.wired : prices.bralette
    return withGarters ? priceTable.with[months] : priceTable.without[months]
  }

  const getPricePerMonth = (months: 3 | 6 | 12) => {
    return Math.round(getPrice(months) / months)
  }
  return (
    <>
      <Navbar />
      {/* Toast notifikace */}
      {showToast && (
        <div className="fixed top-24 left-4 right-4 sm:left-auto sm:right-4 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 sm:min-w-[300px]">
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-bold">Přidáno do košíku!</p>
              <p className="text-sm opacity-90">Předplatné {selectedPlan} měsíců</p>
            </div>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {/* Desktop Image */}
            <div 
              className="hidden md:block absolute inset-0 bg-cover bg-bottom bg-no-repeat"
              style={{ backgroundImage: 'url(/hero_section_new.png)' }}
            />
            {/* Mobile Image */}
            <div 
              className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/hero_section_new_mobile.JPG)' }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="container max-w-4xl text-center relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 tracking-tight uppercase text-white animate-fade-in">
              Předplatné
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
              Dopřejte si pravidelnou dodávku luxusního prádla přímo ke dveřím
            </p>
          </div>
        </section>

        {/* Myšlenka + Pro koho */}
        <section className="py-16 bg-gradient-to-br from-pink-50/30 via-white to-purple-50/20 relative overflow-hidden">
          {/* Dekorativní kruhy */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-pink-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
          
          <div className="container max-w-6xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Myšlenka */}
              <div className="group">
                <div className="mb-3 inline-block">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#931e31] to-[#b8263d] rounded-full"></div>
                </div>
                <h2 className="text-3xl font-bold mb-6 tracking-tight bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                  Myšlenka
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Vnímáme, že ženy často potěší něco, co nečekají. A tak nás s mamkou napadlo vytvořit službu, která ti každý měsíc přinese <span className="text-[#931e31] font-bold">malý zážitek</span>.
                </p>
              </div>

              {/* Pro koho */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-pink-100/50 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="mb-3 inline-block">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#931e31] to-[#b8263d] rounded-full"></div>
                </div>
                <h2 className="text-3xl font-bold mb-6 tracking-tight bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                  Pro koho to je
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform duration-300">
                    <div className="p-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 group-hover/item:from-[#931e31] group-hover/item:to-[#b8263d] transition-all duration-300">
                      <Sparkles className="h-5 w-5 text-[#931e31] group-hover/item:text-white transition-colors duration-300" />
                    </div>
                    <p className="text-gray-700 mt-1">Pro ženy, které <strong className="text-[#931e31]">milují překvapení</strong></p>
                  </div>
                  <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform duration-300">
                    <div className="p-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 group-hover/item:from-[#931e31] group-hover/item:to-[#b8263d] transition-all duration-300">
                      <Heart className="h-5 w-5 text-[#931e31] group-hover/item:text-white transition-colors duration-300" />
                    </div>
                    <p className="text-gray-700 mt-1">Pro ženy, které chtějí <strong className="text-[#931e31]">zkusit nové barvy a střihy</strong></p>
                  </div>
                  <div className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform duration-300">
                    <div className="p-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 group-hover/item:from-[#931e31] group-hover/item:to-[#b8263d] transition-all duration-300">
                      <Gift className="h-5 w-5 text-[#931e31] group-hover/item:text-white transition-colors duration-300" />
                    </div>
                    <p className="text-gray-700 mt-1">Pro ženy, které chtějí <strong className="text-[#931e31]">moment jen pro sebe</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Jak to funguje + Proč to milovat */}
        <section className="py-16 bg-white">
          <div className="container max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Jak to funguje */}
              <div>
                
                <div className="mb-3 inline-block">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#931e31] to-[#b8263d] rounded-full"></div>
                </div>
                <h2 className="text-3xl font-bold mb-8 tracking-tight bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                  Jak to funguje
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-all duration-300">
                    <div className="flex-shrink-0 text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">💌</div>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 flex-1 shadow-sm group-hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold mb-1 text-gray-800">Vybereš si délku</h3>
                      <p className="text-gray-600">3, 6 nebo 12 měsíců</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-all duration-300">
                    <div className="flex-shrink-0 text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🎁</div>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 flex-1 shadow-sm group-hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold mb-1 text-gray-800">Každý měsíc ti pošleme set</h3>
                      <p className="text-gray-600">S láskou vybraný, aby ti perfektně seděl</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-all duration-300">
                    <div className="flex-shrink-0 text-4xl transform group-hover:scale-110 transition-transform duration-300">✨</div>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 flex-1 shadow-sm group-hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold mb-1 text-gray-800">Vždy ve tvém stylu</h3>
                      <p className="text-gray-600">Jedinečný, kvalitní a laděný s Monlii</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-all duration-300">
                    <div className="flex-shrink-0 text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🎄</div>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 flex-1 shadow-sm group-hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold mb-1 text-gray-800">Laděné s obdobím</h3>
                      <p className="text-gray-600">Vánoce, zima, jaro, valentýn, léto... každý set ladí s nadcházející sezónou</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proč to milovat */}
              <div>
                <div className="mb-3 inline-block">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#931e31] to-[#b8263d] rounded-full"></div>
                </div>
                <h2 className="text-3xl font-bold mb-8 tracking-tight bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                  Proč to milovat
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      1
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 flex-1 shadow-sm group-hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold mb-1 text-gray-800">Dárek sama sobě</h3>
                      <p className="text-gray-600">Zasloužíš si radost, jen proto, že existuješ</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      2
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 flex-1 shadow-sm group-hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold mb-1 text-gray-800">Radost u dveří</h3>
                      <p className="text-gray-600">Překvapení každý měsíc, i když na něj zapomeneš</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group hover:translate-x-2 transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d] flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      3
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 flex-1 shadow-sm group-hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold mb-1 text-gray-800">Sebeobjevování</h3>
                      <p className="text-gray-600">Nové styly a barvy, které možná ani neznáš</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Balíčky předplatného */}
        <section id="packages-section" className="py-16 bg-gradient-to-b from-white via-pink-50/10 to-white">
          <div className="container max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight uppercase">Vyberte si období</h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              Zaplatíte celou částku najednou a každý měsíc vám přijde překvapení
            </p>

            {/* Toggle pro typ podprsenky */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => setBraType('wired')}
                  className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 ${
                    braType === 'wired'
                      ? 'bg-gradient-to-r from-[#931e31] to-[#b8263d] text-white shadow-md scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  S kosticemi
                </button>
                <button
                  onClick={() => setBraType('bralette')}
                  className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 ${
                    braType === 'bralette'
                      ? 'bg-gradient-to-r from-[#931e31] to-[#b8263d] text-white shadow-md scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Braletková
                </button>
              </div>
            </div>

            {/* Toggle pro typ setu */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => setWithGarters(false)}
                  className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 ${
                    !withGarters 
                      ? 'bg-gradient-to-r from-[#931e31] to-[#b8263d] text-white shadow-md scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Bez podvazků
                </button>
                <button
                  onClick={() => setWithGarters(true)}
                  className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 ${
                    withGarters 
                      ? 'bg-gradient-to-r from-[#931e31] to-[#b8263d] text-white shadow-md scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  S podvazky
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 3 měsíce */}
              <Card 
                className={`border-0 rounded-3xl soft-shadow-lg overflow-hidden relative transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  selectedPlan === 3 ? 'ring-4 ring-[#931e31] scale-105' : ''
                }`}
              >
                {selectedPlan === 3 && (
                  <Badge className="absolute top-4 left-4 bg-[#931e31] text-white rounded-full px-4 py-1.5 shadow-md z-10">
                    ✓ Vybráno
                  </Badge>
                )}
                <CardHeader className="bg-gradient-to-br from-gray-50 to-pink-50/30 p-8">
                  <CardTitle className="text-2xl text-center">3 měsíce</CardTitle>
                  <div className="text-center mt-4">
                    <span className="text-4xl font-bold text-[#931e31]">{getPrice(3)} Kč</span>
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-2">{getPricePerMonth(3)} Kč/měsíc</p>
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">3 sety prádla (1 každý měsíc)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{braType === 'wired' ? 'Podprsenka s kosticemi' : 'Braletková podprsenka'}</span>
                    </li>
                    {withGarters && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">S podvazky</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Náhodný výběr překvapení</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Doprava zdarma</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Platba předem</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => {
                      setSelectedPlan(3)
                      scrollToForm()
                    }}
                    className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white rounded-full py-6 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Vybrat
                  </Button>
                </CardContent>
              </Card>

              {/* 6 měsíců */}
              <Card 
                className={`border-0 rounded-3xl soft-shadow-lg overflow-hidden relative transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  selectedPlan === 6 ? 'ring-4 ring-[#931e31] scale-105' : ''
                }`}
              >
                {selectedPlan === 6 ? (
                  <Badge className="absolute top-4 right-4 bg-[#931e31] text-white rounded-full px-4 py-1.5 shadow-md z-10">
                    ✓ Vybráno
                  </Badge>
                ) : (
                  <Badge className="absolute top-4 right-4 bg-[#931e31] text-white rounded-full px-4 py-1.5 shadow-md z-10">
                    Nejoblíbenější
                  </Badge>
                )}
                <CardHeader className="bg-gradient-to-br from-[#931e31]/10 to-pink-100/50 p-8">
                  <CardTitle className="text-2xl text-center">6 měsíců</CardTitle>
                  <div className="text-center mt-4">
                    <span className="text-4xl font-bold text-[#931e31]">{getPrice(6)} Kč</span>
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-2">{getPricePerMonth(6)} Kč/měsíc</p>
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">6 setů prádla (1 každý měsíc)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{braType === 'wired' ? 'Podprsenka s kosticemi' : 'Braletková podprsenka'}</span>
                    </li>
                    {withGarters && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">S podvazky</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Náhodný výběr překvapení</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Doprava zdarma</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Platba předem</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => {
                      setSelectedPlan(6)
                      scrollToForm()
                    }}
                    className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white rounded-full py-6 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Vybrat
                  </Button>
                </CardContent>
              </Card>

              {/* 12 měsíců */}
              <Card 
                className={`border-0 rounded-3xl soft-shadow-lg overflow-hidden relative transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  selectedPlan === 12 ? 'ring-4 ring-[#931e31] scale-105' : ''
                }`}
              >
                {selectedPlan === 12 && (
                  <Badge className="absolute top-4 left-4 bg-[#931e31] text-white rounded-full px-4 py-1.5 shadow-md z-10">
                    ✓ Vybráno
                  </Badge>
                )}
                <CardHeader className="bg-gradient-to-br from-gray-50 to-pink-50/30 p-8">
                  <CardTitle className="text-2xl text-center">12 měsíců</CardTitle>
                  <div className="text-center mt-4">
                    <span className="text-4xl font-bold text-[#931e31]">{getPrice(12)} Kč</span>
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-2">{getPricePerMonth(12)} Kč/měsíc</p>
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">12 setů prádla (1 každý měsíc)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{braType === 'wired' ? 'Podprsenka s kosticemi' : 'Braletková podprsenka'}</span>
                    </li>
                    {withGarters && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">S podvazky</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Náhodný výběr překvapení</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Doprava zdarma</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-[#931e31] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Platba předem</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => {
                      setSelectedPlan(12)
                      scrollToForm()
                    }}
                    className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white rounded-full py-6 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Vybrat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Formulář na rozměry */}
        {selectedPlan && (
          <section id="measurement-form" className="py-16 bg-white">
            <div className="container max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight uppercase">Zadejte své rozměry</h2>
              <p className="text-center text-gray-600 mb-8">
                Aby vám perfektně padlo, potřebujeme znát vaše rozměry
              </p>

              {/* Měřící tabulka */}
              <div className="mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent to-[#931e31] rounded-full"></div>
                  <h3 className="text-xl font-bold text-center bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                    Návod k měření - {braType === 'wired' ? 'Podprsenka s kosticemi' : 'Braletková podprsenka'}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-[#931e31] to-transparent rounded-full"></div>
                </div>
                <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 backdrop-blur-sm rounded-3xl soft-shadow-lg p-6 max-w-2xl mx-auto border border-pink-100/50 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <Image 
                    src={braType === 'wired' ? '/merici_tabulka_kostice.png' : '/merici_tabulka_braletka.png'}
                    alt={braType === 'wired' ? 'Měřící tabulka - S kosticemi' : 'Měřící tabulka - Braletková'}
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-xl shadow-md"
                  />
                </div>
              </div>

              <Card className="border-0 rounded-3xl soft-shadow-lg p-8 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 border border-pink-100/50">
                {/* Tlačítko změnit balíček */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                      Vybrán balíček: {selectedPlan} měsíců
                    </h3>
                    <Button
                      type="button"
                      onClick={scrollToPackages}
                      variant="outline"
                      className="border-2 border-[#931e31] text-[#931e31] hover:bg-gradient-to-r hover:from-[#931e31] hover:to-[#b8263d] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
                    >
                      Změnit balíček
                    </Button>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-pink-100/50 shadow-sm">
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d]"></div>
                        <p>{braType === 'wired' ? 'Podprsenka s kosticemi' : 'Braletková podprsenka'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#931e31] to-[#b8263d]"></div>
                        <p>{withGarters ? 'S podvazky' : 'Bez podvazků'}</p>
                      </div>
                      <div className="pt-2 border-t border-pink-200/50 mt-3">
                        <p className="font-bold text-lg bg-gradient-to-r from-[#931e31] to-[#b8263d] bg-clip-text text-transparent">
                          Celkem: {getPrice(selectedPlan!)} Kč
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleAddToCart} className="space-y-6">
                  <div className={`grid grid-cols-1 ${braType === 'bralette' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">
                        Velikost podprsenky
                      </label>
                      <select
                        value={measurements.size}
                        onChange={(e) => setMeasurements({...measurements, size: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#931e31] focus:ring-2 focus:ring-[#931e31]/20 outline-none transition-all duration-300 hover:border-[#931e31]/50 hover:shadow-md cursor-pointer"
                      >
                        <option value="">Vyberte velikost</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                      </select>
                    </div>

                    {braType === 'wired' && (
                      <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">
                          Velikost košíčku
                        </label>
                        <select
                          value={measurements.group}
                          onChange={(e) => setMeasurements({...measurements, group: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#931e31] focus:ring-2 focus:ring-[#931e31]/20 outline-none transition-all duration-300 hover:border-[#931e31]/50 hover:shadow-md cursor-pointer"
                        >
                          <option value="">Vyberte velikost</option>
                          <option value="MINI">MINI</option>
                          <option value="SOFT">SOFT</option>
                          <option value="BALANCED">BALANCED</option>
                          <option value="FULL">FULL</option>
                          <option value="MAXI">MAXI</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">
                        Velikost kalhotek
                      </label>
                      <select
                        value={measurements.pantiesSize}
                        onChange={(e) => setMeasurements({...measurements, pantiesSize: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#931e31] focus:ring-2 focus:ring-[#931e31]/20 outline-none transition-all duration-300 hover:border-[#931e31]/50 hover:shadow-md cursor-pointer"
                      >
                        <option value="">Vyberte velikost</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button 
                      type="submit"
                      disabled={
                        braType === 'wired' 
                          ? (!measurements.size || !measurements.group || !measurements.pantiesSize)
                          : (!measurements.size || !measurements.pantiesSize)
                      }
                      className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white rounded-full py-6 text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      🛒 Přidat do košíku - {selectedPlan && getPrice(selectedPlan)} Kč
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-gradient-to-b from-white to-pink-50/30">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Připraveni začít?</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Dopřejte si luxus pravidelného dodání kvalitního prádla a staňte se součástí Monlii rodiny
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={scrollToPackages}
                className="bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white px-10 py-7 text-lg rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
              >
                Vybrat balíček
              </Button>
              <Link href="/kontakty#kontaktni-formular">
                <Button variant="outline" className="border-0 bg-white hover:bg-[#931e31] hover:text-white transition-all duration-300 rounded-full px-10 py-7 text-lg shadow-md hover:shadow-lg hover:scale-110 active:scale-95">
                  Máte dotazy?
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

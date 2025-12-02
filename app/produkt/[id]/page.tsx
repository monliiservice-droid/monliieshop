'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddToCartButton } from '@/components/add-to-cart-button'
import Image from 'next/image'
import Link from 'next/link'
import { Ruler, Package, Shield } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '@/lib/product-types'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('popis')

  useEffect(() => {
    async function loadProduct() {
      const { id } = await params
      try {
        const response = await fetch(`/api/products/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        } else {
          notFound()
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [params])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <p>Načítání produktu...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (!product) {
    notFound()
  }

  // Detekce, zda produkt obsahuje podprsenku
  const hasBra = product.category && (
    product.category === PRODUCT_CATEGORIES.BRA_WIRED ||
    product.category === PRODUCT_CATEGORIES.BRA_BRALETTE ||
    product.category === PRODUCT_CATEGORIES.SET_WIRED_WITH_GARTERS ||
    product.category === PRODUCT_CATEGORIES.SET_WIRED_WITHOUT_GARTERS ||
    product.category === PRODUCT_CATEGORIES.SET_BRALETTE_WITH_GARTERS ||
    product.category === PRODUCT_CATEGORIES.SET_BRALETTE_WITHOUT_GARTERS
  )

  // Určit, zda je to braletka nebo s kosticí
  const isBralette = product.category && (
    product.category === PRODUCT_CATEGORIES.BRA_BRALETTE ||
    product.category === PRODUCT_CATEGORIES.SET_BRALETTE_WITH_GARTERS ||
    product.category === PRODUCT_CATEGORIES.SET_BRALETTE_WITHOUT_GARTERS
  )

  const scrollToMeasurement = () => {
    setActiveTab('mereni')
    setTimeout(() => {
      const element = document.getElementById('product-tabs')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const images = JSON.parse(product.images)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="py-12">
          <div className="container max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Galerie obrázků */}
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden soft-shadow-lg">
                  {images.length > 0 ? (
                    <Image
                      src={images[0]}
                      alt={product.name}
                      width={800}
                      height={1000}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Bez obrázku
                    </div>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {images.slice(1, 5).map((img: string, idx: number) => (
                      <div key={idx} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden soft-shadow hover:soft-shadow-lg transition-all duration-300 cursor-pointer">
                        <Image
                          src={img}
                          alt={`${product.name} ${idx + 2}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informace o produktu */}
              <div className="space-y-6">
                <div>
                  {product.category && (
                    <Badge className="mb-3 bg-gradient-to-r from-pink-50 to-rose-50 text-gray-700 hover:from-pink-100 hover:to-rose-100 rounded-full px-4 py-1.5 shadow-sm">
                      {product.category}
                    </Badge>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{product.name}</h1>
                  <p className="text-4xl font-bold text-[#931e31] mb-6">{product.price} Kč</p>
                </div>

                {product.description && (
                  <div className="prose prose-lg">
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Přidat do košíku komponent */}
                <AddToCartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    images: product.images,
                    category: product.category
                  }}
                  variants={product.variants}
                  hasBra={hasBra}
                  onMeasurementClick={scrollToMeasurement}
                />

                {/* Výhody */}
                <div className="grid grid-cols-1 gap-4 pt-6">
                  <div className="flex items-start space-x-3">
                    <Package className="h-6 w-6 text-[#931e31] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Rychlé doručení</h3>
                      <p className="text-sm text-gray-600">Doručení do 2-3 pracovních dnů přes Zásilkovnu</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-[#931e31] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Bezpečná platba</h3>
                      <p className="text-sm text-gray-600">Platba kartou nebo na dobírku</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Ruler className="h-6 w-6 text-[#931e31] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Ruční výroba</h3>
                      <p className="text-sm text-gray-600">Každý kousek je unikát vyrobený s láskou</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs s dalšími informacemi */}
            <div id="product-tabs" className="mt-16">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-2xl h-auto p-2">
                  <TabsTrigger 
                    value="popis" 
                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#931e31] data-[state=active]:shadow-md px-6 py-3 transition-all duration-300"
                  >
                    Popis
                  </TabsTrigger>
                  {hasBra && (
                    <TabsTrigger 
                      value="mereni" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#931e31] data-[state=active]:shadow-md px-6 py-3 transition-all duration-300"
                    >
                      <Ruler className="mr-2 h-4 w-4" />
                      Jak měřit
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="popis" className="py-8">
                  <Card className="border-0 rounded-3xl soft-shadow-lg bg-white">
                    <CardContent className="p-8">
                      <div className="prose prose-lg max-w-none">
                        <h3 className="text-2xl font-bold mb-4">O produktu</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {product.description || 'Detailní popis produktu bude doplněn.'}
                        </p>
                        <h4 className="text-xl font-semibold mt-6 mb-3">Materiál a péče</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Vysoce kvalitní materiály pro maximální pohodlí</li>
                          <li>• Ruční výroba s důrazem na detail</li>
                          <li>• Praní v ruce v chladné vodě</li>
                          <li>• Nesušit v sušičce</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {hasBra && (
                  <TabsContent value="mereni" className="py-8">
                    <Card className="border-0 rounded-3xl soft-shadow-lg bg-white">
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold mb-6">
                          Návod k měření - {isBralette ? 'Braletková podprsenka' : 'Podprsenka s kosticemi'}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Pro správnou volbu velikosti použijte níže uvedenou měřící tabulku. 
                          Doporučujeme měřit tělo bez oblečení pro co nejpřesnější výsledek.
                        </p>
                        <div className="bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-3xl p-6 border border-pink-100/50 max-w-2xl mx-auto">
                          <Image
                            src={isBralette ? '/merici_tabulka_braletka.png' : '/merici_tabulka_kostice.png'}
                            alt={isBralette ? 'Měřící tabulka - Braletková' : 'Měřící tabulka - S kosticemi'}
                            width={800}
                            height={600}
                            className="w-full h-auto rounded-xl shadow-md"
                          />
                        </div>
                        <div className="mt-6 p-4 bg-[#931e31]/5 border-l-4 border-[#931e31]">
                          <p className="text-sm text-gray-700">
                            <strong>Tip:</strong> Pokud si nejste jistí velikostí, <Link href="/kontakty#kontaktni-formular" className="text-[#931e31] hover:text-[#b8263d] font-semibold underline">kontaktujte nás</Link>. 
                            Rádi vám poradíme s výběrem správné velikosti.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

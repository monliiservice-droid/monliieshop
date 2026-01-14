'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/lib/product-types'
import { getDisplayPrice } from '@/lib/set-config-types'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  images: string
  category: string | null
  isSet?: boolean
  setOptions?: string
}

interface ProductsGridProps {
  products: Product[]
}

export function ProductsGrid({ products }: ProductsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Získat unikátní kategorie z produktů
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]

  // Filtrovat produkty podle vybrané kategorie
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  return (
    <div>
      {/* Filtry podle kategorií */}
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-[#931e31] text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vše
        </button>
        {categories.filter(c => c !== 'all').map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as string)}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-[#931e31] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid produktů */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-32 animate-fade-in">
          <p className="text-gray-600 text-xl">
            {selectedCategory === 'all' 
              ? 'Zatím nemáme žádné produkty k zobrazení.'
              : `Žádné produkty v kategorii "${selectedCategory}".`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {filteredProducts.map((product, index) => {
            const images = JSON.parse(product.images)
            // Vypočítat zobrazovací cenu (pro sety použít nejnižší cenu z variant)
            const displayPrice = product.isSet && product.setOptions
              ? getDisplayPrice(JSON.parse(product.setOptions))
              : product.price
            
            return (
              <Card 
                key={product.id} 
                className="overflow-hidden border-0 bg-white transition-all duration-500 rounded-2xl group hover-lift animate-fade-in soft-shadow hover:soft-shadow-lg flex flex-col h-full" 
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <Link href={`/produkt/${product.id}`}>
                  <CardHeader className="p-0 cursor-pointer">
                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                      {images.length > 0 ? (
                        <img 
                          src={images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                          Bez obrázku
                        </div>
                      )}
                      {product.stock === 0 && (
                        <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full px-4 py-1.5 shadow-md">
                          Vyprodáno
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                    </div>
                  </CardHeader>
                </Link>
                <CardContent className="p-6 text-center">
                  <Link href={`/produkt/${product.id}`} className="hover:text-[#931e31] transition-colors">
                    <CardTitle className="text-2xl mb-3 font-bold tracking-tight">{product.name}</CardTitle>
                  </Link>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  )}
                  <p className="text-xl font-bold text-[#931e31]">{displayPrice} Kč</p>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto">
                  <Link href={`/produkt/${product.id}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white rounded-full py-6 font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
                      {product.stock === 0 ? 'Zobrazit detail' : 'Vybrat velikost'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

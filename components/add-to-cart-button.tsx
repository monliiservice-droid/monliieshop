'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Ruler } from 'lucide-react'
import { getSizeOptionsForCategory, SIZE_LABELS } from '@/lib/product-types'

interface ProductVariant {
  id: string
  name: string
  value: string
  stock: number
  priceAdjustment: number
}

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
    images: string
    category: string | null
  }
  variants: ProductVariant[]
  hasBra?: boolean
  onMeasurementClick?: () => void
}

export function AddToCartButton({ product, variants, hasBra, onMeasurementClick }: AddToCartButtonProps) {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)

  const images = JSON.parse(product.images)
  
  // Získat konfiguraci velikostí podle kategorie produktu
  const sizeConfig = product.category ? getSizeOptionsForCategory(product.category) : { fields: [] }
  
  const availableStock = product.stock
  const isOutOfStock = availableStock === 0
  
  // Zkontrolovat, zda jsou vyplněny všechny velikosti
  const allSizesSelected = sizeConfig.fields.length === 0 || 
    sizeConfig.fields.every(field => selectedSizes[field.name])

  const handleAddToCart = () => {
    // Validace
    if (sizeConfig.fields.length > 0 && !allSizesSelected) {
      alert('Prosím vyberte všechny velikosti')
      return
    }

    if (quantity > availableStock) {
      alert('Požadované množství není skladem')
      return
    }

    // Sestavit název varianty
    const sizeDescription = sizeConfig.fields.length > 0 
      ? sizeConfig.fields.map(field => {
          const value = selectedSizes[field.name]
          const label = SIZE_LABELS[value as keyof typeof SIZE_LABELS] || value
          return `${field.label}: ${label}`
        }).join(', ')
      : ''

    // Příprava dat do košíku
    const cartItem = {
      id: `${product.id}_${Object.values(selectedSizes).join('_')}_${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      variant: sizeConfig.fields.length > 0 ? {
        id: 'size_' + Date.now(),
        name: 'Velikost',
        value: sizeDescription
      } : null,
      sizes: selectedSizes,
      image: images.length > 0 ? images[0] : null
    }

    // Uložení do localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    existingCart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(existingCart))

    // Vyslání custom eventu pro aktualizaci navbaru
    window.dispatchEvent(new Event('cartUpdated'))

    // Notifikace
    alert(`${product.name} byl přidán do košíku!`)
    
    // Reset
    setQuantity(1)
    setSelectedSizes({})
  }

  return (
    <div className="space-y-6">
      {/* Tlačítko "Jak měřit" - pouze pro produkty s podprsenkou */}
      {hasBra && onMeasurementClick && (
        <div className="pb-4 border-b border-gray-200">
          <Button
            type="button"
            onClick={onMeasurementClick}
            variant="outline"
            className="w-full border-2 border-[#931e31] text-[#931e31] hover:bg-[#931e31] hover:text-white rounded-full py-4 font-semibold transition-all duration-300"
          >
            <Ruler className="mr-2 h-5 w-5" />
            Jak měřit
          </Button>
        </div>
      )}

      {/* Výběr velikostí podle kategorie */}
      {sizeConfig.fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-semibold mb-3">
            {field.label} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {field.options.map((option) => {
              const displayLabel = SIZE_LABELS[option as keyof typeof SIZE_LABELS] || option
              const isSelected = selectedSizes[field.name] === option
              
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedSizes(prev => ({
                    ...prev,
                    [field.name]: option
                  }))}
                  className={`
                    py-3 px-4 rounded-xl border-2 font-semibold transition-all duration-300
                    ${isSelected
                      ? 'border-[#931e31] bg-[#931e31] text-white shadow-md'
                      : 'border-gray-300 hover:border-[#931e31] hover:bg-pink-50'
                    }
                  `}
                >
                  {displayLabel}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Množství */}
      <div>
        <label className="block text-sm font-semibold mb-3">
          Množství
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-[#931e31] hover:bg-pink-50 font-bold transition-all"
          >
            -
          </button>
          <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
            disabled={quantity >= availableStock}
            className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-[#931e31] hover:bg-pink-50 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
          <span className="text-sm text-gray-600">
            (max. {availableStock} ks)
          </span>
        </div>
      </div>

      {/* Cena */}
      <div className="flex items-center justify-between py-4 border-y border-gray-200">
        <span className="text-lg font-semibold">Celková cena:</span>
        <span className="text-3xl font-bold text-[#931e31]">
          {(product.price * quantity).toFixed(0)} Kč
        </span>
      </div>

      {/* Tlačítko do košíku */}
      <Button 
        onClick={handleAddToCart}
        className="w-full bg-gradient-to-r from-[#931e31] to-[#b8263d] hover:from-[#6b1623] hover:to-[#931e31] text-white py-6 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isOutOfStock || (sizeConfig.fields.length > 0 && !allSizesSelected)}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isOutOfStock ? 'Vyprodáno' : 'Přidat do košíku'}
      </Button>
    </div>
  )
}

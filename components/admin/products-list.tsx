'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { getDisplayPrice } from '@/lib/set-config-types'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string | null
  sortOrder: number
  isSet?: boolean
  setOptions?: string
}

interface ProductsListProps {
  initialProducts: Product[]
}

export function ProductsList({ initialProducts }: ProductsListProps) {
  const [products, setProducts] = useState(initialProducts)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleDragStart = (e: React.DragEvent, productId: string) => {
    setDraggingId(productId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, targetProductId: string) => {
    e.preventDefault()
    if (!draggingId || draggingId === targetProductId) return

    const draggedIndex = products.findIndex(p => p.id === draggingId)
    const targetIndex = products.findIndex(p => p.id === targetProductId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newProducts = [...products]
    const [removed] = newProducts.splice(draggedIndex, 1)
    newProducts.splice(targetIndex, 0, removed)

    setProducts(newProducts)
  }

  const handleDragEnd = async () => {
    if (!draggingId) return

    setIsSaving(true)
    
    // Aktualizovat sortOrder pro všechny produkty podle nového pořadí
    const productOrders = products.map((product, index) => ({
      id: product.id,
      sortOrder: index
    }))

    try {
      const response = await fetch('/api/admin/products/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productOrders }),
      })

      if (!response.ok) {
        throw new Error('Chyba při ukládání pořadí')
      }
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Chyba při ukládání pořadí produktů')
    } finally {
      setDraggingId(null)
      setIsSaving(false)
    }
  }

  return (
    <div className="relative">
      {isSaving && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <p className="text-sm font-medium">Ukládám pořadí...</p>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Název</TableHead>
            <TableHead>Cena</TableHead>
            <TableHead>Sklad</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Stav</TableHead>
            <TableHead className="text-right">Akce</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            // Vypočítat zobrazovací cenu (pro sety použít nejnižší cenu z variant)
            const displayPrice = product.isSet && product.setOptions
              ? getDisplayPrice(JSON.parse(product.setOptions))
              : product.price
            
            return (
              <TableRow
                key={product.id}
                draggable
                onDragStart={(e) => handleDragStart(e, product.id)}
                onDragOver={(e) => handleDragOver(e, product.id)}
                onDragEnd={handleDragEnd}
                className={`cursor-move ${draggingId === product.id ? 'opacity-50' : ''}`}
              >
                <TableCell>
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{displayPrice} Kč</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {product.category && (
                  <Badge variant="outline">{product.category}</Badge>
                )}
              </TableCell>
              <TableCell>
                {product.stock > 0 ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Skladem
                  </Badge>
                ) : (
                  <Badge variant="destructive">Vyprodáno</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/admin/produkty/${product.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <DeleteProductButton productId={product.id} productName={product.name} />
              </TableCell>
            </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

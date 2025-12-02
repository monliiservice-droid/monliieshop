'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Opravdu chcete smazat produkt "${productName}"? Tato akce je nevratná.`)) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Chyba při mazání produktu')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Chyba při mazání produktu')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}

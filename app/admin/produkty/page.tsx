import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductsList } from '@/components/admin/products-list'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        category: true,
        sortOrder: true
      }
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produkty</h1>
          <p className="text-gray-600">Spravujte své produkty</p>
        </div>
        <Link href="/admin/produkty/novy">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Přidat produkt
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Všechny produkty ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Zatím nemáte žádné produkty.</p>
              <Link href="/admin/produkty/novy">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Vytvořit první produkt
                </Button>
              </Link>
            </div>
          ) : (
            <ProductsList initialProducts={products} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

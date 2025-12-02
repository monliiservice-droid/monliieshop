import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { DeleteProductButton } from '@/components/admin/delete-product-button'

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Název</TableHead>
                  <TableHead>Cena</TableHead>
                  <TableHead>Sklad</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.price} Kč</TableCell>
                    <TableCell>{product.stock} ks</TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge variant="default" className="bg-green-500">Skladem</Badge>
                      ) : (
                        <Badge variant="destructive">Vyprodáno</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/produkty/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

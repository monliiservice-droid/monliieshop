import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/product-form'
import { productToFormValues } from '@/lib/product-form-values'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) notFound()

  return <ProductForm productId={product.id} initialValues={productToFormValues(product)} />
}

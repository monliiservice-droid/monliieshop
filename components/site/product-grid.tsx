import type { ProductCardData } from '@/lib/catalog'
import type { ProductCardStyle } from '@/lib/site-settings'
import { ProductCard } from './product-card'

const COLUMN_CLASS = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-3 xl:grid-cols-4',
} as const

export function ProductGrid({
  products,
  variant,
  columns = 4,
}: {
  products: ProductCardData[]
  variant: ProductCardStyle
  columns?: 2 | 3 | 4
}) {
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 ${COLUMN_CLASS[columns]}`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} variant={variant} priority={index < 4} />
      ))}
    </div>
  )
}

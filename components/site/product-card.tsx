import Link from 'next/link'
import type { ProductCardData } from '@/lib/catalog'
import type { ProductCardStyle } from '@/lib/site-settings'
import { SmartImage } from './smart-image'
import { Price } from './price'

interface ProductCardProps {
  product: ProductCardData
  variant?: ProductCardStyle
  sizes?: string
  priority?: boolean
}

function Badges({ product }: { product: ProductCardData }) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
      {product.salePercent !== null && (
        <span className="bg-wine px-2 py-1 text-[11px] font-semibold tracking-wide text-white">−{product.salePercent} %</span>
      )}
      {product.isNew && product.salePercent === null && (
        <span className="bg-linen px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">Novinka</span>
      )}
      {!product.inStock && (
        <span className="bg-ink/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-linen">Vyprodáno</span>
      )}
    </div>
  )
}

function ProductImage({ product, sizes, priority, ratio }: { product: ProductCardData; sizes: string; priority?: boolean; ratio: string }) {
  return (
    <div className={`relative ${ratio} overflow-hidden bg-sand`}>
      {product.image ? (
        <>
          <SmartImage
            src={product.image}
            alt={product.name}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-[transform,opacity] duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
          />
          {product.hoverImage && (
            <SmartImage
              src={product.hoverImage}
              alt=""
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center font-display text-2xl text-clay">Monlii</div>
      )}
      <Badges product={product} />
    </div>
  )
}

export function ProductCard({
  product,
  variant = 'classic',
  sizes = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw',
  priority,
}: ProductCardProps) {
  const href = `/produkt/${product.id}`

  if (variant === 'overlay') {
    return (
      <Link href={href} className="group relative block overflow-hidden">
        <ProductImage product={product} sizes={sizes} priority={priority} ratio="aspect-[3/4]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent p-4 pt-16 text-linen">
          <h3 className="font-display text-xl leading-tight">{product.name}</h3>
          <Price price={product.price} salePrice={product.salePrice} className="mt-1 text-sm font-semibold [&_.text-wine]:text-linen [&_.text-stone]:text-linen/70" />
        </div>
      </Link>
    )
  }

  if (variant === 'minimal') {
    return (
      <Link href={href} className="group block">
        <ProductImage product={product} sizes={sizes} priority={priority} ratio="aspect-[4/5]" />
        <div className="mt-3 flex items-baseline justify-between gap-3 text-sm">
          <h3 className="truncate">{product.name}</h3>
          <Price price={product.price} salePrice={product.salePrice} className="shrink-0 font-semibold" />
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <ProductImage product={product} sizes={sizes} priority={priority} ratio="aspect-[3/4]" />
      <div className="mt-4 space-y-1">
        {product.categoryName && <p className="text-[11px] uppercase tracking-[0.16em] text-stone">{product.categoryName}</p>}
        <h3 className="font-display text-xl leading-snug transition-colors group-hover:text-wine">{product.name}</h3>
        <Price price={product.price} salePrice={product.salePrice} className="text-sm font-semibold" />
      </div>
    </Link>
  )
}

export function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString('cs-CZ')} Kč`
}

interface PriceProps {
  price: number
  salePrice?: number | null
  className?: string
  from?: boolean
}

/** Cena s případnou přeškrtnutou původní cenou */
export function Price({ price, salePrice, className = '', from = false }: PriceProps) {
  const hasSale = salePrice !== null && salePrice !== undefined && salePrice < price
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={hasSale ? 'text-wine' : ''}>
        {from && <span className="font-normal">od </span>}
        {formatPrice(hasSale ? salePrice : price)}
      </span>
      {hasSale && <span className="text-[0.85em] text-stone line-through">{formatPrice(price)}</span>}
    </span>
  )
}

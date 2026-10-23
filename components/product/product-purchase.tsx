'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Ruler } from 'lucide-react'
import { toast } from 'sonner'
import { applySaleDiscount } from '@/lib/pricing'
import { getActivePrice, type SetConfiguration } from '@/lib/set-config-types'
import { SIZE_LABELS, type SizeType } from '@/lib/product-types'
import { findVariant, isAvailable, productSizeFields, type SizeOptions, type StockVariant } from '@/lib/product-stock'
import { Price } from '@/components/site/price'

export interface PurchaseProduct {
  id: string
  name: string
  price: number
  stock: number
  image: string | null
  setConfig: SetConfiguration | null
  colors: { name: string; hex: string }[]
  sizeOptions: SizeOptions
  /** Sklad po velikostech × barvách; prázdné = sklad jedním číslem za produkt */
  variants: StockVariant[]
  allowBackorder: boolean
  backorderLeadTime: string | null
}

interface ProductPurchaseProps {
  product: PurchaseProduct
  sizeType: SizeType
  salePercent: number | null
  saleName: string | null
  showMeasureLink: boolean
}

function OptionButton({
  active,
  onClick,
  children,
  label,
  unavailable = false,
  madeToOrder = false,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  label?: string
  unavailable?: boolean
  madeToOrder?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={unavailable}
      aria-pressed={active}
      aria-label={label}
      title={unavailable ? 'Není k dispozici' : madeToOrder ? 'Na zakázku' : undefined}
      className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${
        active
          ? 'border-ink bg-ink text-linen'
          : unavailable
            ? 'cursor-not-allowed border-line bg-white text-ink-soft/50 line-through'
            : `bg-white hover:border-ink ${madeToOrder ? 'border-dashed border-clay' : 'border-line'}`
      }`}
    >
      {children}
    </button>
  )
}

export function ProductPurchase({ product, sizeType, salePercent, saleName, showMeasureLink }: ProductPurchaseProps) {
  const router = useRouter()
  const { setConfig } = product

  const { variants, allowBackorder } = product
  const hasVariants = variants.length > 0

  // Nabízejí se jen barvy, které mají aspoň jednu variantu
  const colors = hasVariants ? product.colors.filter((c) => variants.some((v) => v.color === c.name)) : product.colors
  const firstAvailableColor = colors.find((c) => !hasVariants || variants.some((v) => v.color === c.name && isAvailable(v.stock, allowBackorder)))
  const [color, setColor] = useState(firstAvailableColor?.name ?? colors[0]?.name ?? '')
  const [braType, setBraType] = useState<'bralette' | 'wired'>(
    setConfig?.braType === 'wired' ? 'wired' : 'bralette'
  )
  const [withGarters, setWithGarters] = useState(false)
  const [sizes, setSizes] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [showErrors, setShowErrors] = useState(false)

  const effectiveSizeType: SizeType = setConfig ? 'set' : sizeType
  const allSizeFields = productSizeFields(effectiveSizeType, product.sizeOptions, setConfig?.braType === 'both' ? braType : setConfig?.braType)
  // Hlavní velikost (první pole) nabízíme jen v těch hodnotách, které mají sklad
  const sizeFields = allSizeFields.map((field, index) =>
    index === 0 && hasVariants ? { ...field, options: field.options.filter((o) => variants.some((v) => v.size === o)) } : field
  )
  const primary = sizeFields[0]?.name ?? null

  const variantOf = (size: string | undefined, colorName: string) => findVariant(variants, size ?? '', colorName)
  // Stav kombinace: skladem / na zakázku / nedostupná
  const comboState = (size: string | undefined, colorName: string): 'stock' | 'order' | 'none' => {
    const stock = hasVariants ? variantOf(size, colorName)?.stock : product.stock
    if (stock === undefined) return 'none'
    if (stock > 0) return 'stock'
    return allowBackorder ? 'order' : 'none'
  }
  const sizeState = (size: string) => (hasVariants && (color || colors.length === 0) ? comboState(size, color) : 'stock')
  const colorState = (colorName: string) => {
    if (!hasVariants) return comboState(undefined, colorName)
    if (primary && sizes[primary]) return comboState(sizes[primary], colorName)
    const states = variants.filter((v) => v.color === colorName).map((v) => comboState(v.size, colorName))
    return states.includes('stock') ? 'stock' : states.includes('order') ? 'order' : 'none'
  }

  const selectionComplete = (!primary || !!sizes[primary]) && (colors.length === 0 || !!color)
  const selectedStock = hasVariants ? (selectionComplete ? variantOf(primary ? sizes[primary] : '', color)?.stock ?? 0 : null) : product.stock
  const anythingAvailable = hasVariants
    ? variants.some((v) => isAvailable(v.stock, allowBackorder))
    : isAvailable(product.stock, allowBackorder)

  const basePrice = setConfig ? getActivePrice(setConfig, braType, withGarters) || product.price : product.price
  const finalPrice = salePercent ? applySaleDiscount(basePrice, salePercent) : basePrice
  const outOfStock = !anythingAvailable || (selectedStock !== null && !isAvailable(selectedStock, allowBackorder))
  const maxQuantity = allowBackorder ? 20 : Math.max(selectedStock ?? 20, 1)

  const missing = useMemo(() => {
    const list: string[] = []
    if (colors.length > 0 && !color) list.push('barvu')
    for (const field of sizeFields) if (!sizes[field.name]) list.push(field.label.toLowerCase())
    return list
  }, [colors.length, color, sizeFields, sizes])

  const addToCart = () => {
    if (missing.length > 0) {
      setShowErrors(true)
      toast.error(`Vyberte prosím ${missing.join(', ')}`)
      return
    }
    if (selectedStock === null || !isAvailable(selectedStock, allowBackorder)) {
      toast.error('Tato kombinace velikosti a barvy není k dispozici')
      return
    }
    if (!allowBackorder && quantity > selectedStock) {
      toast.error(`Skladem je jen ${selectedStock} ks`)
      return
    }

    // Popis varianty pro košík, objednávku i fakturu
    const parts: string[] = []
    if (color) parts.push(`Barva: ${color}`)
    if (setConfig) {
      const setParts = []
      if (setConfig.braType === 'both') setParts.push(braType === 'bralette' ? 'Braletka' : 'S kosticí')
      if (setConfig.hasGartersOption) setParts.push(withGarters ? 'S podvazky' : 'Bez podvazků')
      if (setParts.length) parts.push(setParts.join(', '))
    }
    const sizeText = sizeFields
      .map((f) => `${f.label}: ${SIZE_LABELS[sizes[f.name]] || sizes[f.name]}`)
      .join(', ')
    if (sizeText) parts.push(sizeText)

    const cartItem = {
      id: `${product.id}_${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      quantity,
      variant: parts.length ? { id: `v_${Date.now()}`, name: 'Varianta', value: parts.join(' | ') } : null,
      sizes,
      color: color || undefined,
      setSelection: setConfig
        ? {
            braType: setConfig.braType === 'both' ? braType : setConfig.braType,
            hasGarters: setConfig.hasGartersOption ? withGarters : false,
          }
        : undefined,
      image: product.image,
    }

    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      cart.push(cartItem)
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success(`${product.name} je v košíku`, {
        action: { label: 'Do košíku', onClick: () => router.push('/kosik') },
      })
      setQuantity(1)
    } catch {
      toast.error('Košík se nepodařilo uložit. Zkuste to prosím znovu.')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Price price={basePrice} salePrice={salePercent ? finalPrice : null} className="text-2xl font-semibold" />
        {salePercent !== null && (
          <p className="mt-2 text-sm text-wine">
            {saleName} · sleva {salePercent} %
          </p>
        )}
      </div>

      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em]">
            Barva: <span className="font-normal normal-case tracking-normal text-ink-soft">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const state = colorState(c.name)
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setColor(c.name)
                    // Velikost, která v nové barvě není, zrušíme
                    if (primary && sizes[primary] && comboState(sizes[primary], c.name) === 'none') {
                      setSizes({ ...sizes, [primary]: '' })
                    }
                  }}
                  aria-pressed={color === c.name}
                  aria-label={state === 'none' ? `${c.name} – není k dispozici` : c.name}
                  title={state === 'none' ? `${c.name} – v této velikosti není` : state === 'order' ? `${c.name} – na zakázku` : c.name}
                  className={`relative h-10 w-10 rounded-full border-2 p-0.5 transition-colors ${color === c.name ? 'border-ink' : 'border-transparent hover:border-clay'} ${state === 'none' ? 'opacity-40' : ''}`}
                >
                  <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                  {state === 'none' && <span className="absolute left-1/2 top-1/2 h-px w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink" aria-hidden />}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {setConfig?.braType === 'both' && (
        <fieldset>
          <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em]">Podprsenka</legend>
          <div className="flex flex-wrap gap-2">
            <OptionButton active={braType === 'bralette'} onClick={() => { setBraType('bralette'); setSizes({}) }}>Braletka</OptionButton>
            <OptionButton active={braType === 'wired'} onClick={() => { setBraType('wired'); setSizes({}) }}>S kosticí</OptionButton>
          </div>
        </fieldset>
      )}

      {setConfig?.hasGartersOption && (
        <fieldset>
          <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em]">Podvazky</legend>
          <div className="flex flex-wrap gap-2">
            <OptionButton active={!withGarters} onClick={() => setWithGarters(false)}>Bez podvazků</OptionButton>
            <OptionButton active={withGarters} onClick={() => setWithGarters(true)}>S podvazky</OptionButton>
          </div>
        </fieldset>
      )}

      {sizeFields.map((field) => (
        <fieldset key={field.name}>
          <legend className="mb-3 flex w-full items-center justify-between text-[12px] font-semibold uppercase tracking-[0.14em]">
            <span className={showErrors && !sizes[field.name] ? 'text-wine' : ''}>{field.label}</span>
            {showMeasureLink && field === sizeFields[0] && (
              <a href="#jak-merit" className="flex items-center gap-1.5 font-normal normal-case tracking-normal text-ink-soft underline-offset-4 hover:underline">
                <Ruler className="h-4 w-4" /> Jak změřit velikost
              </a>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {field.options.map((option) => {
              const state = field.name === primary ? sizeState(option) : 'stock'
              return (
                <OptionButton
                  key={option}
                  active={sizes[field.name] === option}
                  unavailable={state === 'none'}
                  madeToOrder={state === 'order'}
                  onClick={() => setSizes({ ...sizes, [field.name]: option })}
                >
                  {SIZE_LABELS[option] || option}
                </OptionButton>
              )
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex gap-3">
        <div className="flex h-12 items-center border border-line bg-white">
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-full w-11 items-center justify-center hover:bg-sand" aria-label="Méně kusů">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            className="flex h-full w-11 items-center justify-center hover:bg-sand"
            aria-label="Více kusů"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={addToCart} disabled={outOfStock} className="btn btn-ink flex-1">
          {outOfStock ? 'Vyprodáno' : 'Přidat do košíku'}
        </button>
      </div>
      <p className="text-sm text-ink-soft">
        <StockNote
          outOfStock={outOfStock}
          stock={selectedStock}
          quantity={quantity}
          allowBackorder={allowBackorder}
          leadTime={product.backorderLeadTime}
        />
      </p>
    </div>
  )
}

function StockNote({
  outOfStock,
  stock,
  quantity,
  allowBackorder,
  leadTime,
}: {
  outOfStock: boolean
  stock: number | null
  quantity: number
  allowBackorder: boolean
  leadTime: string | null
}) {
  const sewing = leadTime ? `ušijeme ho pro vás (doba výroby ${leadTime})` : 'ušijeme ho pro vás'
  if (outOfStock) {
    return (
      <>
        {stock === null ? 'Tento kousek je vyprodaný.' : 'Tato varianta je vyprodaná.'}{' '}
        <Link href="/kontakty" className="underline underline-offset-4">Napište nám</Link> – rády ho ušijeme znovu.
      </>
    )
  }
  // Velikost/barva ještě není vybraná
  if (stock === null) {
    return <>{allowBackorder ? `Co není skladem, ${sewing}. ` : ''}Po výběru velikosti uvidíte dostupnost.</>
  }
  if (stock <= 0) return <>Na zakázku – {sewing}.</>
  if (allowBackorder && quantity > stock) return <>Skladem {stock} ks, zbytek {sewing.replace(' ho', '')}.</>
  if (stock <= 3) return <>Poslední kusy skladem ({stock} ks).</>
  return <>Skladem, odesíláme do 3–5 pracovních dnů.</>
}

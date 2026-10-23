'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Ruler } from 'lucide-react'
import { toast } from 'sonner'
import { applySaleDiscount } from '@/lib/pricing'
import { getActivePrice, type SetConfiguration } from '@/lib/set-config-types'
import { SIZE_LABELS, getSizeFields, type SizeType } from '@/lib/product-types'
import { Price } from '@/components/site/price'

export interface PurchaseProduct {
  id: string
  name: string
  price: number
  stock: number
  image: string | null
  setConfig: SetConfiguration | null
  colors: { name: string; hex: string }[]
}

interface ProductPurchaseProps {
  product: PurchaseProduct
  sizeType: SizeType
  salePercent: number | null
  saleName: string | null
  showMeasureLink: boolean
}

function OptionButton({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`min-w-12 border px-4 py-2.5 text-sm transition-colors ${active ? 'border-ink bg-ink text-linen' : 'border-line bg-white hover:border-ink'}`}
    >
      {children}
    </button>
  )
}

export function ProductPurchase({ product, sizeType, salePercent, saleName, showMeasureLink }: ProductPurchaseProps) {
  const router = useRouter()
  const { setConfig } = product

  const [color, setColor] = useState(product.colors[0]?.name ?? '')
  const [braType, setBraType] = useState<'bralette' | 'wired'>(
    setConfig?.braType === 'wired' ? 'wired' : 'bralette'
  )
  const [withGarters, setWithGarters] = useState(false)
  const [sizes, setSizes] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [showErrors, setShowErrors] = useState(false)

  const effectiveSizeType: SizeType = setConfig ? 'set' : sizeType
  const sizeFields = getSizeFields(effectiveSizeType, setConfig?.braType === 'both' ? braType : setConfig?.braType)

  const basePrice = setConfig ? getActivePrice(setConfig, braType, withGarters) || product.price : product.price
  const finalPrice = salePercent ? applySaleDiscount(basePrice, salePercent) : basePrice
  const outOfStock = product.stock <= 0

  const missing = useMemo(() => {
    const list: string[] = []
    if (product.colors.length > 0 && !color) list.push('barvu')
    for (const field of sizeFields) if (!sizes[field.name]) list.push(field.label.toLowerCase())
    return list
  }, [product.colors.length, color, sizeFields, sizes])

  const addToCart = () => {
    if (missing.length > 0) {
      setShowErrors(true)
      toast.error(`Vyberte prosím ${missing.join(', ')}`)
      return
    }
    if (quantity > product.stock) {
      toast.error(`Skladem je jen ${product.stock} ks`)
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

      {product.colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em]">
            Barva: <span className="font-normal normal-case tracking-normal text-ink-soft">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                aria-pressed={color === c.name}
                aria-label={c.name}
                title={c.name}
                className={`h-10 w-10 rounded-full border-2 p-0.5 transition-colors ${color === c.name ? 'border-ink' : 'border-transparent hover:border-clay'}`}
              >
                <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
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
            {field.options.map((option) => (
              <OptionButton key={option} active={sizes[field.name] === option} onClick={() => setSizes({ ...sizes, [field.name]: option })}>
                {SIZE_LABELS[option] || option}
              </OptionButton>
            ))}
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
            onClick={() => setQuantity(Math.min(Math.max(product.stock, 1), quantity + 1))}
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
        {outOfStock ? (
          <>Tento kousek je vyprodaný. <Link href="/kontakty" className="underline underline-offset-4">Napište nám</Link> – rády ho ušijeme znovu.</>
        ) : product.stock <= 3 ? (
          <>Poslední kusy skladem ({product.stock} ks).</>
        ) : (
          <>Skladem, odesíláme do 3–5 pracovních dnů.</>
        )}
      </p>
    </div>
  )
}

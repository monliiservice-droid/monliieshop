'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Minus, Plus, X } from 'lucide-react'
import { SmartImage } from '@/components/site/smart-image'
import { formatPrice } from '@/components/site/price'
import { ZASILKOVNA_CONFIG } from '@/lib/zasilkovna-zbox'
import { calculateDiscountAmount, loadAppliedDiscount, saveAppliedDiscount, type AppliedDiscount } from '@/lib/pricing'

interface CartItem {
  id: string
  productId?: string
  type?: string
  plan?: number
  measurements?: { size?: string; group?: string; pantiesSize?: string }
  price: number
  name: string
  quantity?: number
  variant?: { id: string; name: string; value: string } | null
  image?: string | null
}

function saveCart(items: CartItem[]) {
  localStorage.setItem('cart', JSON.stringify(items))
  window.dispatchEvent(new Event('cartUpdated'))
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscountState] = useState<AppliedDiscount | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)

  useEffect(() => {
    try {
      const cart = localStorage.getItem('cart')
      if (cart) setCartItems(JSON.parse(cart))
      const savedDiscount = loadAppliedDiscount()
      if (savedDiscount) {
        setAppliedDiscountState(savedDiscount)
        setDiscountCode(savedDiscount.code)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const removeFromCart = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id)
    setCartItems(updated)
    saveCart(updated)
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    const updated = cartItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    setCartItems(updated)
    saveCart(updated)
  }

  // Uplatněný kód držíme i v localStorage, aby ho checkout poslal do objednávky
  const setAppliedDiscount = (discount: AppliedDiscount | null) => {
    setAppliedDiscountState(discount)
    saveAppliedDiscount(discount)
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0)
  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
  const discountAmount = appliedDiscount ? calculateDiscountAmount(appliedDiscount, subtotal) : 0
  const total = Math.max(0, subtotal - discountAmount)
  const toFreeShipping = ZASILKOVNA_CONFIG.freeShippingThreshold - total

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Zadejte slevový kód')
      return
    }
    setIsApplyingDiscount(true)
    setDiscountError('')
    try {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim().toUpperCase(), orderAmount: subtotal }),
      })
      const data = await response.json()
      if (response.ok && data.valid) {
        setAppliedDiscount(data.discount)
      } else {
        setDiscountError(data.message || 'Neplatný slevový kód')
        setAppliedDiscount(null)
      }
    } catch {
      setDiscountError('Kód se nepodařilo ověřit, zkuste to prosím znovu')
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    setDiscountError('')
  }

  if (!isLoaded) {
    return <div className="site-container min-h-[50vh] py-20 text-ink-soft">Načítám košík…</div>
  }

  if (cartItems.length === 0) {
    return (
      <section className="site-container py-16 md:py-24">
        <p className="eyebrow mb-5">Košík</p>
        <h1 className="display text-[clamp(2.75rem,6vw,5rem)]">Košík je zatím prázdný</h1>
        <p className="mt-6 max-w-lg text-lg text-ink-soft">Vyberte si z kolekce pro ženy, muže i děti – každý kousek šijeme ručně.</p>
        <Link href="/obchod" className="btn btn-ink mt-10">
          Do obchodu <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    )
  }

  return (
    <section className="site-container py-12 md:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[clamp(2.75rem,6vw,5rem)]">Košík</h1>
        <p className="text-sm text-ink-soft">{itemCount} {itemCount === 1 ? 'kus' : itemCount < 5 ? 'kusy' : 'kusů'}</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <ul className="divide-y divide-line border-y border-line lg:col-span-8">
          {cartItems.map((item) => (
            <li key={item.id} className="flex gap-4 py-6 sm:gap-6">
              <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-sand sm:w-32">
                {item.image ? (
                  <SmartImage src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-lg text-clay">Monlii</div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl leading-snug sm:text-2xl">
                      {item.productId ? <Link href={`/produkt/${item.productId}`} className="link-line">{item.name}</Link> : item.name}
                    </h2>
                    {item.variant?.value && <p className="mt-1 text-sm text-ink-soft">{item.variant.value}</p>}
                    {item.type === 'subscription' && item.measurements && (
                      <p className="mt-1 text-sm text-ink-soft">
                        Podprsenka: {item.measurements.size}
                        {item.measurements.group && `, košíček: ${item.measurements.group}`}
                        {item.measurements.pantiesSize && `, kalhotky: ${item.measurements.pantiesSize}`}
                      </p>
                    )}
                  </div>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="-mr-2 p-2 text-stone hover:text-ink" aria-label={`Odebrat ${item.name}`}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                  {item.type === 'subscription' ? (
                    <span className="text-sm text-stone">1 ks</span>
                  ) : (
                    <div className="flex h-10 items-center border border-line bg-white">
                      <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="flex h-full w-10 items-center justify-center hover:bg-sand" aria-label="Méně kusů">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity || 1}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="flex h-full w-10 items-center justify-center hover:bg-sand" aria-label="Více kusů">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="font-semibold">{formatPrice(item.price * (item.quantity || 1))}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-4">
          <div className="bg-white p-6 lg:sticky lg:top-28 lg:p-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em]">Shrnutí</h2>

            <div className="mt-6">
              {appliedDiscount ? (
                <div className="flex items-center justify-between border border-dashed border-wine/40 bg-wine-soft px-4 py-3 text-sm">
                  <span>
                    Kód <strong>{appliedDiscount.code}</strong> ({appliedDiscount.type === 'percentage' ? `${appliedDiscount.value} %` : formatPrice(appliedDiscount.value)})
                  </span>
                  <button type="button" onClick={removeDiscount} className="text-stone hover:text-ink" aria-label="Odebrat slevový kód">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <label htmlFor="discount" className="text-sm text-ink-soft">Slevový kód</label>
                  <div className="mt-2 flex">
                    <input
                      id="discount"
                      className="field h-11 uppercase"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && applyDiscountCode()}
                      placeholder="KÓD"
                    />
                    <button type="button" onClick={applyDiscountCode} disabled={isApplyingDiscount || !discountCode.trim()} className="btn btn-outline h-11 border-l-0 px-4">
                      {isApplyingDiscount ? '…' : 'Použít'}
                    </button>
                  </div>
                  {discountError && <p className="mt-2 text-sm text-wine">{discountError}</p>}
                </div>
              )}
            </div>

            <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Mezisoučet</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-wine">
                  <dt>Sleva</dt>
                  <dd>−{formatPrice(discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Doprava</dt>
                <dd className="text-ink-soft">v dalším kroku</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="font-semibold">Celkem</dt>
                <dd className="font-display text-3xl">{formatPrice(total)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              {toFreeShipping > 0 ? (
                <>
                  <p className="text-sm text-ink-soft">Do dopravy zdarma zbývá <strong className="text-ink">{formatPrice(toFreeShipping)}</strong></p>
                  <div className="mt-2 h-1 bg-sand">
                    <div className="h-full bg-wine" style={{ width: `${Math.min(100, (total / ZASILKOVNA_CONFIG.freeShippingThreshold) * 100)}%` }} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-wine">Máte dopravu do Z-BOXu zdarma.</p>
              )}
            </div>

            <Link href="/checkout" className="btn btn-ink mt-8 w-full">
              Pokračovat k dopravě <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/obchod" className="mt-4 block text-center text-sm text-ink-soft underline-offset-4 hover:underline">
              Pokračovat v nákupu
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}

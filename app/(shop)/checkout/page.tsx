'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { formatPrice } from '@/components/site/price'
import { ZASILKOVNA_CONFIG, pickZBox, type ZBoxPoint } from '@/lib/zasilkovna-zbox'
import {
  COD_FEE,
  calculateDiscountAmount,
  getPaymentFee,
  loadAppliedDiscount,
  type AppliedDiscount,
  getShippingPrice as getSharedShippingPrice,
  type PaymentMethod,
  type ShippingMethod,
} from '@/lib/pricing'
import { toast } from 'sonner'
import { PICKUP_LOCATIONS } from '@/lib/pickup-locations'

interface CartItem {
  id: string
  name: string
  price: number
  quantity?: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [shippingMethod, setShippingMethod] = useState('zbox')
  const [paymentMethod, setPaymentMethod] = useState('qr_code')
  const [isCompany, setIsCompany] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null)
  const [personalPickupLocation, setPersonalPickupLocation] = useState<'havirov' | 'frenstat' | null>(null)
  const [selectedZBox, setSelectedZBox] = useState<ZBoxPoint | null>(null)
  const [isLoadingZBox, setIsLoadingZBox] = useState(false)
  const [zBoxError, setZBoxError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    company: '',
    ico: '',
    dic: ''
  })

  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = localStorage.getItem('cart')
        if (cart) {
          const parsedCart = JSON.parse(cart)
          setCartItems(parsedCart)
        }
        setAppliedDiscount(loadAppliedDiscount())
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadCart()
  }, [])

  // Výběr Z-BOXu na mapě Zásilkovny
  const handlePickZBox = async () => {
    setShippingMethod('zbox')
    setIsLoadingZBox(true)
    setZBoxError('')
    try {
      const point = await pickZBox()
      if (point) {
        setSelectedZBox(point)
      }
    } catch (error) {
      console.error('Error opening Zásilkovna widget:', error)
      setZBoxError('Mapu Zásilkovny se nepodařilo načíst. Zkuste to prosím znovu.')
    } finally {
      setIsLoadingZBox(false)
    }
  }


  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const quantity = item.quantity || 1
      return total + (item.price * quantity)
    }, 0)
  }

  const getDiscountAmount = () => {
    return appliedDiscount ? calculateDiscountAmount(appliedDiscount, getTotalPrice()) : 0
  }

  // Doprava zdarma se počítá z částky po slevě (stejně jako na serveru)
  const getDiscountedSubtotal = () => getTotalPrice() - getDiscountAmount()

  const getShippingPrice = () => {
    return getSharedShippingPrice(shippingMethod as ShippingMethod, getDiscountedSubtotal())
  }

  const getCodFee = () => {
    // No COD fee for store_payment or qr_code
    return getPaymentFee(paymentMethod as PaymentMethod)
  }

  const getFinalPrice = () => {
    return getDiscountedSubtotal() + getShippingPrice() + getCodFee()
  }

  // Reset payment method when shipping method changes to avoid invalid combinations
  useEffect(() => {
    if (shippingMethod === 'personal') {
      // If switching to personal pickup and COD is selected, switch to qr_code
      if (paymentMethod === 'cod') {
        setPaymentMethod('qr_code')
      }
    } else {
      // If switching away from personal pickup and store_payment is selected, switch to qr_code
      if (paymentMethod === 'store_payment') {
        setPaymentMethod('qr_code')
      }
    }
  }, [shippingMethod, paymentMethod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validace Z-BOX
    if (shippingMethod === 'zbox' && !selectedZBox) {
      toast.error('Vyberte prosím Z-BOX, kam vám zásilku doručíme.')
      return
    }
    
    // Validace místa osobního odběru
    if (shippingMethod === 'personal' && !personalPickupLocation) {
      toast.error('Prosím vyberte místo osobního odběru (Havířov nebo Frenštát)')
      return
    }
    
    // Validace firemních údajů
    if (isCompany && (!formData.company || !formData.ico)) {
      toast.error('Prosím vyplňte všechny povinné firemní údaje')
      return
    }
    
    // Sestavení dat objednávky
    const orderData = {
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        isCompany,
        ...(isCompany && {
          company: formData.company,
          ico: formData.ico,
          dic: formData.dic
        })
      },
      shipping: {
        method: shippingMethod,
        price: getShippingPrice(),
        ...(shippingMethod === 'zbox' && selectedZBox && {
          zbox: selectedZBox
        }),
        ...(shippingMethod === 'personal' && personalPickupLocation && {
          personalLocation: personalPickupLocation
        })
      },
      payment: {
        method: paymentMethod,
        fee: getCodFee()
      },
      items: cartItems,
      ...(appliedDiscount && {
        discountCode: appliedDiscount.code,
        discountAmount: getDiscountAmount()
      }),
      // getFinalPrice() už obsahuje dopravu i poplatek za dobírku
      totalPrice: getFinalPrice()
    }
    
    // Uložení dat do sessionStorage
    sessionStorage.setItem('orderData', JSON.stringify(orderData))
    
    // Přesměrování na souhrn objednávky
    router.push('/souhrn-objednavky')
  }

  // Prázdný košík → zpět do košíku (přesměrování v efektu, ne během vykreslování)
  useEffect(() => {
    if (isLoaded && cartItems.length === 0) router.replace('/kosik')
  }, [isLoaded, cartItems.length, router])

  if (!isLoaded || cartItems.length === 0) {
    return <div className="site-container min-h-[50vh] py-20 text-ink-soft">Načítám…</div>
  }

  const field = (name: keyof typeof formData, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm text-ink-soft">{label}</label>
      <input
        id={name}
        className="field"
        value={formData[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        {...props}
      />
    </div>
  )

  const choice = (active: boolean) =>
    `relative flex w-full cursor-pointer items-start gap-4 border p-5 text-left transition-colors ${active ? 'border-ink bg-white' : 'border-line hover:border-clay'}`
  const radio = (active: boolean) => (
    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-ink' : 'border-clay'}`}>
      {active && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
    </span>
  )
  const zboxPrice = getDiscountedSubtotal() >= ZASILKOVNA_CONFIG.freeShippingThreshold ? 'Zdarma' : formatPrice(ZASILKOVNA_CONFIG.zboxDeliveryPrice)
  const zboxMissing = shippingMethod === 'zbox' && !selectedZBox

  return (
    <section className="site-container py-12 md:py-16">
      <Link href="/kosik" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Zpět do košíku
      </Link>
      <h1 className="display mt-6 text-[clamp(2.75rem,6vw,5rem)]">Doprava a platba</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          {/* 1. Kontaktní údaje */}
          <fieldset>
            <legend className="mb-6 flex items-baseline gap-3">
              <span className="font-display text-3xl italic text-wine">01</span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.14em]">Kontaktní a fakturační údaje</span>
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('firstName', 'Jméno *', { required: true, autoComplete: 'given-name' })}
              {field('lastName', 'Příjmení *', { required: true, autoComplete: 'family-name' })}
              {field('email', 'E-mail *', { required: true, type: 'email', autoComplete: 'email' })}
              {field('phone', 'Telefon *', { required: true, type: 'tel', autoComplete: 'tel', placeholder: '+420 123 456 789' })}
              <div className="sm:col-span-2">{field('address', 'Ulice a číslo popisné *', { required: true, autoComplete: 'street-address' })}</div>
              {field('city', 'Město *', { required: true, autoComplete: 'address-level2' })}
              {field('zip', 'PSČ *', { required: true, autoComplete: 'postal-code', inputMode: 'numeric' })}
            </div>
            <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={isCompany} onChange={(e) => setIsCompany(e.target.checked)} className="h-4 w-4 accent-[#2b0f0c]" />
              Nakupuji na firmu
            </label>
            {isCompany && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">{field('company', 'Název firmy *', { required: true, autoComplete: 'organization' })}</div>
                {field('ico', 'IČO *', { required: true })}
                {field('dic', 'DIČ')}
              </div>
            )}
          </fieldset>

          {/* 2. Doprava */}
          <fieldset>
            <legend className="mb-6 flex items-baseline gap-3">
              <span className="font-display text-3xl italic text-wine">02</span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.14em]">Doprava</span>
            </legend>
            <div className="space-y-3">
              <div className={choice(shippingMethod === 'zbox')} onClick={() => setShippingMethod('zbox')} role="radio" aria-checked={shippingMethod === 'zbox'} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setShippingMethod('zbox')}>
                {radio(shippingMethod === 'zbox')}
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold">Zásilkovna Z-BOX</span>
                    <span className="text-sm">{zboxPrice}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">Výdejní box podle vašeho výběru, doručení obvykle do 2 dnů od odeslání.</p>
                  {shippingMethod === 'zbox' && (
                    <div className="mt-4 space-y-3">
                      {selectedZBox && (
                        <div className="border-l-2 border-wine bg-sand px-4 py-3 text-sm">
                          <p className="font-semibold">{selectedZBox.name}</p>
                          <p className="text-ink-soft">{selectedZBox.street}, {selectedZBox.zip} {selectedZBox.city}</p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePickZBox()
                        }}
                        disabled={isLoadingZBox}
                        className="btn btn-outline h-11"
                      >
                        <MapPin className="h-4 w-4" />
                        {isLoadingZBox ? 'Načítám mapu…' : selectedZBox ? 'Změnit Z-BOX' : 'Vybrat Z-BOX na mapě'}
                      </button>
                      {zBoxError && <p className="text-sm text-wine">{zBoxError}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className={choice(shippingMethod === 'personal')} onClick={() => setShippingMethod('personal')} role="radio" aria-checked={shippingMethod === 'personal'} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setShippingMethod('personal')}>
                {radio(shippingMethod === 'personal')}
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold">Osobní odběr</span>
                    <span className="text-sm">Zdarma</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">Vyzvednutí na jednom z našich míst – ozveme se, až bude připraveno.</p>
                  {shippingMethod === 'personal' && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {(Object.keys(PICKUP_LOCATIONS) as (keyof typeof PICKUP_LOCATIONS)[]).map((key) => {
                        const location = PICKUP_LOCATIONS[key]
                        const active = personalPickupLocation === key
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPersonalPickupLocation(key)
                            }}
                            className={`border px-4 py-3 text-left text-sm transition-colors ${active ? 'border-ink bg-sand' : 'border-line hover:border-clay'}`}
                            aria-pressed={active}
                          >
                            <span className="block font-semibold">{location.name}</span>
                            <span className="text-ink-soft">{location.address}, {location.zip} {location.city}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </fieldset>

          {/* 3. Platba */}
          <fieldset>
            <legend className="mb-6 flex items-baseline gap-3">
              <span className="font-display text-3xl italic text-wine">03</span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.14em]">Platba</span>
            </legend>
            <div className="space-y-3">
              <button type="button" className={choice(paymentMethod === 'qr_code')} onClick={() => setPaymentMethod('qr_code')} aria-pressed={paymentMethod === 'qr_code'}>
                {radio(paymentMethod === 'qr_code')}
                <span className="flex-1">
                  <span className="flex justify-between gap-4">
                    <span className="font-semibold">QR platba převodem</span>
                    <span className="text-sm">Zdarma</span>
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">QR kód a platební údaje dostanete hned po objednání.</span>
                </span>
              </button>
              {shippingMethod === 'personal' ? (
                <button type="button" className={choice(paymentMethod === 'store_payment')} onClick={() => setPaymentMethod('store_payment')} aria-pressed={paymentMethod === 'store_payment'}>
                  {radio(paymentMethod === 'store_payment')}
                  <span className="flex-1">
                    <span className="flex justify-between gap-4">
                      <span className="font-semibold">Platba při vyzvednutí</span>
                      <span className="text-sm">Zdarma</span>
                    </span>
                    <span className="mt-1 block text-sm text-ink-soft">Zaplatíte hotově nebo kartou na místě.</span>
                  </span>
                </button>
              ) : (
                <button type="button" className={choice(paymentMethod === 'cod')} onClick={() => setPaymentMethod('cod')} aria-pressed={paymentMethod === 'cod'}>
                  {radio(paymentMethod === 'cod')}
                  <span className="flex-1">
                    <span className="flex justify-between gap-4">
                      <span className="font-semibold">Dobírka</span>
                      <span className="text-sm">+{formatPrice(COD_FEE)}</span>
                    </span>
                    <span className="mt-1 block text-sm text-ink-soft">Zaplatíte při vyzvednutí zásilky v Z-BOXu.</span>
                  </span>
                </button>
              )}
            </div>
          </fieldset>
        </div>

        {/* Souhrn */}
        <aside className="lg:col-span-5">
          <div className="bg-white p-6 lg:sticky lg:top-28 lg:p-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em]">Vaše objednávka</h2>
            <ul className="mt-6 space-y-3 text-sm">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="text-ink-soft">
                    {item.name} <span className="text-stone">× {item.quantity || 1}</span>
                  </span>
                  <span className="shrink-0">{formatPrice(item.price * (item.quantity || 1))}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Mezisoučet</dt>
                <dd>{formatPrice(getTotalPrice())}</dd>
              </div>
              {appliedDiscount && getDiscountAmount() > 0 && (
                <div className="flex justify-between text-wine">
                  <dt>Sleva ({appliedDiscount.code})</dt>
                  <dd>−{formatPrice(getDiscountAmount())}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Doprava</dt>
                <dd>{getShippingPrice() === 0 ? 'Zdarma' : formatPrice(getShippingPrice())}</dd>
              </div>
              {getCodFee() > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Dobírka</dt>
                  <dd>{formatPrice(getCodFee())}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="font-semibold">Celkem</dt>
                <dd className="font-display text-3xl">{formatPrice(getFinalPrice())}</dd>
              </div>
            </dl>
            <button type="submit" disabled={zboxMissing} className="btn btn-ink mt-8 w-full">
              {zboxMissing ? 'Nejdřív vyberte Z-BOX' : 'Pokračovat na souhrn'}
              {!zboxMissing && <ArrowRight className="h-4 w-4" />}
            </button>
            <p className="mt-4 text-center text-xs text-stone">Objednávku ještě zkontrolujete v dalším kroku.</p>
          </div>
        </aside>
      </form>
    </section>
  )
}

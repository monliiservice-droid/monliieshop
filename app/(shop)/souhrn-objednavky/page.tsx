'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { saveAppliedDiscount } from '@/lib/pricing'
import { getPickupLocation } from '@/lib/pickup-locations'
import { formatPrice } from '@/components/site/price'

const SHIPPING_NAMES: Record<string, string> = { zbox: 'Zásilkovna Z-BOX', personal: 'Osobní odběr' }
const PAYMENT_NAMES: Record<string, string> = { qr_code: 'QR platba převodem', cod: 'Dobírka', store_payment: 'Platba při vyzvednutí' }

function Confirmation({ orderNumber, children }: { orderNumber: string; children: React.ReactNode }) {
  return (
    <section className="site-container py-12 md:py-20">
      <p className="eyebrow mb-5">Objednávka přijata</p>
      <h1 className="display text-[clamp(2.75rem,6vw,5.5rem)]">Děkujeme!</h1>
      <p className="mt-4 text-lg text-ink-soft">
        Číslo objednávky <strong className="text-ink">{orderNumber}</strong>
      </p>
      <div className="mt-12">{children}</div>
      <Link href="/obchod" className="btn btn-outline mt-12">Pokračovat v nákupu</Link>
    </section>
  )
}

export default function OrderSummaryPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [qrPaymentData, setQrPaymentData] = useState<any>(null)
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string>('')

  useEffect(() => {
    const data = sessionStorage.getItem('orderData')
    if (!data) {
      router.push('/checkout')
      return
    }
    setOrderData(JSON.parse(data))
  }, [router])

  // Po odeslání objednávky zobrazíme potvrzení od začátku stránky
  useEffect(() => {
    if (orderSubmitted) {
      window.scrollTo({ top: 0 })
    }
  }, [orderSubmitted])

  const handleSubmitOrder = async () => {
    if (!orderData) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Vymazání košíku a session dat
        localStorage.removeItem('cart')
        saveAppliedDiscount(null)
        sessionStorage.removeItem('orderData')
        window.dispatchEvent(new Event('cartUpdated'))
        
        setSubmittedOrderNumber(result.order.orderNumber)
        
        // QR platba zobrazí QR kód, ostatní platby jen potvrzení objednávky
        if (orderData.payment.method === 'qr_code' && result.qrPaymentData) {
          setQrPaymentData(result.qrPaymentData)
        }
        setOrderSubmitted(true)
      } else if (response.status >= 400 && response.status < 500 && result.message) {
        // Chyba validace ze serveru (např. změněné ceny) – ukážeme konkrétní důvod
        toast.error(result.message)
        if (result.code === 'DISCOUNT_INVALID') {
          // Neplatný/vyčerpaný kód odebereme, zákazník ho uvidí v košíku
          saveAppliedDiscount(null)
          router.push('/kosik')
        } else if (response.status === 409) {
          router.push('/kosik')
        }
      } else {
        throw new Error(result.message || 'Chyba při vytváření objednávky')
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Chyba při odesílání objednávky. Zkuste to prosím znovu nebo nás kontaktujte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!orderData) {
    return <div className="site-container min-h-[50vh] py-20 text-ink-soft">Načítám…</div>
  }

  const { customer, shipping, payment, items } = orderData
  const itemsTotal = items.reduce((sum: number, item: any) => sum + item.price * (item.quantity || 1), 0)

  if (orderSubmitted && qrPaymentData) {
    return (
      <Confirmation orderNumber={submittedOrderNumber}>
        <div className="grid gap-10 bg-white p-6 md:grid-cols-[auto_1fr] md:p-10">
          <div className="mx-auto border border-line p-4">
            {/* QR kód generuje externí služba dynamicky – optimalizace přes next/image nedává smysl */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrPaymentData.qrCodeURL} alt="QR kód pro platbu" className="h-60 w-60" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em]">Zaplaťte QR kódem</h2>
            <p className="mt-3 text-ink-soft">Naskenujte kód v aplikaci své banky. Jakmile platba dorazí, pustíme se do práce.</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-6 border-b border-line pb-3">
                <dt className="text-ink-soft">Číslo účtu</dt>
                <dd className="font-semibold">{qrPaymentData.accountNumber}/{qrPaymentData.bankCode}</dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-line pb-3">
                <dt className="text-ink-soft">Variabilní symbol</dt>
                <dd className="font-semibold">{qrPaymentData.variableSymbol}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-ink-soft">Částka</dt>
                <dd className="font-display text-3xl">{formatPrice(orderData.totalPrice)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm text-ink-soft">Platební údaje i fakturu jsme poslali na <strong className="text-ink">{customer.email}</strong>.</p>
          </div>
        </div>
      </Confirmation>
    )
  }

  if (orderSubmitted) {
    const isPickup = shipping.method === 'personal'
    return (
      <Confirmation orderNumber={submittedOrderNumber}>
        <div className="max-w-2xl space-y-3 border-l-2 border-wine pl-6 text-lg text-ink-soft">
          <p>Potvrzení jsme poslali na <strong className="text-ink">{customer.email}</strong>.</p>
          <p>{payment.method === 'cod' ? 'Objednávku zaplatíte při převzetí zásilky v Z-BOXu.' : 'Objednávku zaplatíte při vyzvednutí.'}</p>
          <p>
            {isPickup
              ? 'Jakmile bude objednávka připravená k vyzvednutí, dáme vám vědět e-mailem.'
              : 'Jakmile objednávku odešleme, pošleme vám e-mail se sledovacím číslem zásilky.'}
          </p>
        </div>
      </Confirmation>
    )
  }

  const pickup = shipping.method === 'personal' && shipping.personalLocation ? getPickupLocation(shipping.personalLocation) : null

  return (
    <section className="site-container py-12 md:py-16">
      <Link href="/checkout" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Upravit údaje
      </Link>
      <h1 className="display mt-6 text-[clamp(2.75rem,6vw,5rem)]">Kontrola objednávky</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7">
          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em]">Fakturační údaje</h2>
            <div className="mt-4 space-y-1 text-ink-soft">
              <p className="text-ink">{customer.firstName} {customer.lastName}</p>
              {customer.isCompany && (
                <p>
                  {customer.company}, IČO {customer.ico}
                  {customer.dic && `, DIČ ${customer.dic}`}
                </p>
              )}
              <p>{customer.address}</p>
              <p>{customer.zip} {customer.city}</p>
              <p className="pt-2">{customer.email}</p>
              <p>{customer.phone}</p>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em]">Doprava</h2>
              <div className="mt-4 space-y-1 text-ink-soft">
                <p className="text-ink">{SHIPPING_NAMES[shipping.method] || shipping.method}</p>
                {shipping.zbox && (
                  <p>{shipping.zbox.name}, {shipping.zbox.street}, {shipping.zbox.zip} {shipping.zbox.city}</p>
                )}
                {pickup && <p>{pickup.name}, {pickup.address}, {pickup.zip} {pickup.city}</p>}
              </div>
            </div>
            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em]">Platba</h2>
              <p className="mt-4 text-ink">{PAYMENT_NAMES[payment.method] || payment.method}</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="bg-white p-6 lg:sticky lg:top-28 lg:p-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em]">Položky</h2>
            <ul className="mt-6 space-y-4 text-sm">
              {items.map((item: any) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span>
                    <span className="block">{item.name} <span className="text-stone">× {item.quantity || 1}</span></span>
                    {item.variant?.value && <span className="block text-xs text-stone">{item.variant.value}</span>}
                  </span>
                  <span className="shrink-0">{formatPrice(item.price * (item.quantity || 1))}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Zboží</dt>
                <dd>{formatPrice(itemsTotal)}</dd>
              </div>
              {orderData.discountAmount > 0 && (
                <div className="flex justify-between text-wine">
                  <dt>Sleva ({orderData.discountCode})</dt>
                  <dd>−{formatPrice(orderData.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Doprava</dt>
                <dd>{shipping.price === 0 ? 'Zdarma' : formatPrice(shipping.price)}</dd>
              </div>
              {payment.fee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Dobírka</dt>
                  <dd>{formatPrice(payment.fee)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <dt className="font-semibold">K úhradě</dt>
                <dd className="font-display text-3xl">{formatPrice(orderData.totalPrice)}</dd>
              </div>
            </dl>
            <button type="button" onClick={handleSubmitOrder} disabled={isSubmitting} className="btn btn-wine mt-8 w-full">
              {isSubmitting ? 'Odesílám…' : 'Objednat s povinností platby'}
            </button>
            <p className="mt-4 text-center text-xs leading-relaxed text-stone">
              Odesláním souhlasíte s <Link href="/obchodni-podminky" className="underline">obchodními podmínkami</Link> a{' '}
              <Link href="/ochrana-osobnich-udaju" className="underline">zpracováním osobních údajů</Link>.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

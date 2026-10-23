'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { getSubscriptionName, getSubscriptionPrice, type SubscriptionBraType, type SubscriptionPlan } from '@/lib/pricing'
import { SIZE_OPTIONS } from '@/lib/product-types'
import { formatPrice } from './price'

const PLANS: SubscriptionPlan[] = [3, 6, 12]

const STEPS = [
  { title: 'Vyberete si délku', text: '3, 6 nebo 12 měsíců – zaplatíte najednou.' },
  { title: 'Každý měsíc set', text: 'S láskou vybraný, aby vám perfektně seděl.' },
  { title: 'Vždy ve vašem stylu', text: 'Jedinečný, kvalitní a laděný s Monlii.' },
  { title: 'Podle sezóny', text: 'Vánoce, zima, jaro, valentýn, léto… každý set ladí s obdobím.' },
]

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-5 py-3 text-sm transition-colors ${active ? 'border-ink bg-ink text-linen' : 'border-line bg-white hover:border-ink'}`}
    >
      {children}
    </button>
  )
}

function SizeSelect({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-ink-soft">{label}</label>
      <select id={id} required value={value} onChange={(e) => onChange(e.target.value)} className="field cursor-pointer">
        <option value="">Vyberte</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export function SubscriptionConfigurator() {
  const router = useRouter()
  const [plan, setPlan] = useState<SubscriptionPlan>(6)
  const [braType, setBraType] = useState<SubscriptionBraType>('wired')
  const [withGarters, setWithGarters] = useState(false)
  const [measurements, setMeasurements] = useState({ size: '', group: '', pantiesSize: '' })

  const price = getSubscriptionPrice(braType, withGarters, plan)

  const addToCart = (e: React.FormEvent) => {
    e.preventDefault()
    const needsCup = braType === 'wired'
    if (!measurements.size || !measurements.pantiesSize || (needsCup && !measurements.group)) {
      toast.error('Vyplňte prosím všechny rozměry')
      return
    }
    const cartItem = {
      id: Date.now().toString(),
      type: 'subscription',
      plan,
      braType,
      withGarters,
      measurements: needsCup ? measurements : { ...measurements, group: '' },
      price,
      name: getSubscriptionName(braType, withGarters, plan),
      addedAt: new Date().toISOString(),
    }
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      cart.push(cartItem)
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success('Předplatné je v košíku', { action: { label: 'Do košíku', onClick: () => router.push('/kosik') } })
    } catch {
      toast.error('Košík se nepodařilo uložit. Zkuste to prosím znovu.')
    }
  }

  return (
    <>
      <section className="site-container grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-5">
          <p className="eyebrow mb-5">Myšlenka</p>
          <p className="display text-[clamp(2rem,3.5vw,3rem)]">
            Ženy často potěší něco, co nečekají. Proto jsme vymyslely službu, která každý měsíc přinese malý zážitek.
          </p>
        </div>
        <ol className="grid gap-8 sm:grid-cols-2 md:col-span-6 md:col-start-7">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-ink/20 pt-5">
              <span className="font-display text-4xl italic text-wine">{String(index + 1).padStart(2, '0')}</span>
              <h2 className="mt-2 font-semibold">{step.title}</h2>
              <p className="mt-1 text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-sand">
        <form onSubmit={addToCart} className="site-container grid gap-12 py-16 md:grid-cols-12 md:py-24">
          <div className="space-y-10 md:col-span-7">
            <div>
              <p className="eyebrow mb-4">1 · Délka předplatného</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {PLANS.map((months) => {
                  const planPrice = getSubscriptionPrice(braType, withGarters, months)
                  const active = plan === months
                  return (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setPlan(months)}
                      aria-pressed={active}
                      className={`border p-5 text-left transition-colors ${active ? 'border-ink bg-white' : 'border-line hover:border-clay'}`}
                    >
                      <span className="font-display text-4xl">{months}</span>
                      <span className="ml-2 text-sm">měsíců</span>
                      <span className="mt-3 block font-semibold">{formatPrice(planPrice)}</span>
                      <span className="text-sm text-stone">{formatPrice(planPrice / months)} / měsíc</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-4">2 · Typ podprsenky</p>
              <div className="flex flex-wrap gap-2">
                <Choice active={braType === 'wired'} onClick={() => setBraType('wired')}>S kosticemi</Choice>
                <Choice active={braType === 'bralette'} onClick={() => setBraType('bralette')}>Braletka</Choice>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-4">3 · Podvazky</p>
              <div className="flex flex-wrap gap-2">
                <Choice active={!withGarters} onClick={() => setWithGarters(false)}>Bez podvazků</Choice>
                <Choice active={withGarters} onClick={() => setWithGarters(true)}>S podvazky</Choice>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-4">4 · Vaše rozměry</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <SizeSelect id="size" label="Podprsenka" value={measurements.size} options={SIZE_OPTIONS.BRA_SIZE} onChange={(size) => setMeasurements({ ...measurements, size })} />
                {braType === 'wired' && (
                  <SizeSelect id="group" label="Košíček" value={measurements.group} options={SIZE_OPTIONS.BRA_CUP} onChange={(group) => setMeasurements({ ...measurements, group })} />
                )}
                <SizeSelect id="pantiesSize" label="Kalhotky" value={measurements.pantiesSize} options={SIZE_OPTIONS.STANDARD_SIZE} onChange={(pantiesSize) => setMeasurements({ ...measurements, pantiesSize })} />
              </div>
            </div>
          </div>

          <aside className="md:col-span-5">
            <div className="bg-white p-6 md:sticky md:top-28 md:p-8">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em]">Vaše předplatné</p>
              <p className="mt-4 font-display text-2xl">{getSubscriptionName(braType, withGarters, plan)}</p>
              <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                {[`${plan} setů prádla, každý měsíc jeden`, 'Výběr laděný se sezónou', 'Doprava zdarma', 'Platba předem'].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-wine" /> {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-line pt-6 font-display text-4xl">{formatPrice(price)}</p>
              <button type="submit" className="btn btn-ink mt-6 w-full">Přidat do košíku</button>
              <div className="mt-8">
                <Image
                  src={braType === 'wired' ? '/merici_tabulka_kostice.png' : '/merici_tabulka_braletka.png'}
                  alt="Měřicí tabulka"
                  width={1080}
                  height={1350}
                  sizes="(min-width: 768px) 35vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </aside>
        </form>
      </section>
    </>
  )
}

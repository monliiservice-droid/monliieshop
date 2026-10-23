import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getActiveSales } from '@/lib/sales'
import { getPageHeaders } from '@/lib/site-settings-server'
import { PageHero } from '@/components/site/page-hero'
import { SmartImage } from '@/components/site/smart-image'
import { EmptyState } from '@/components/site/empty-state'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Výprodej | Monlii',
  description: 'Aktuální výprodeje a akce Monlii.',
  alternates: { canonical: '/vyprodej' },
}

export default async function SalesPage() {
  const [sales, headers] = await Promise.all([getActiveSales(), getPageHeaders()])
  const header = headers.vyprodej

  return (
    <>
      <PageHero eyebrow={header.eyebrow} title={header.title} subtitle={header.subtitle} />
      <section className="site-container">
        {sales.length === 0 ? (
          <EmptyState
            title="Teď neprobíhá žádná akce"
            text="Sledujte nás na Instagramu – o dalším výprodeji dáme vědět jako první."
            link={{ text: 'Do obchodu', href: '/obchod' }}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {sales.map((sale) => (
              <Link key={sale.id} href={`/vyprodej/${sale.slug}`} className="group relative block aspect-[4/3] overflow-hidden bg-wine text-white">
                {sale.bannerImage && (
                  <SmartImage src={sale.bannerImage} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-wine-dark/80 to-transparent p-8">
                  <p className="display text-7xl">−{sale.discountPercent}%</p>
                  <h2 className="display mt-3 text-3xl">{sale.name}</h2>
                  <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em]">
                    Nakupovat <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

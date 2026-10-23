import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getProductCards } from '@/lib/catalog'
import { parseSort } from '@/lib/catalog-params'
import { getActiveSales } from '@/lib/sales'
import { getShopSettings } from '@/lib/site-settings-server'
import { SmartImage } from '@/components/site/smart-image'
import { CatalogToolbar } from '@/components/site/catalog-toolbar'
import { ProductGrid } from '@/components/site/product-grid'
import { EmptyState } from '@/components/site/empty-state'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const sale = await prisma.saleEvent.findUnique({ where: { slug }, select: { name: true, description: true, discountPercent: true } })
  if (!sale) return { title: 'Výprodej | Monlii' }
  return {
    title: `${sale.name} – sleva ${sale.discountPercent} % | Monlii`,
    description: sale.description || `${sale.name}: vybrané kousky se slevou ${sale.discountPercent} %.`,
    alternates: { canonical: `/vyprodej/${slug}` },
  }
}

export default async function SaleEventPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sort = parseSort((await searchParams).razeni)

  const [sales, settings] = await Promise.all([getActiveSales(), getShopSettings()])
  const sale = sales.find((s) => s.slug === slug)

  if (!sale) {
    // Akce existuje, ale skončila (nebo ještě nezačala) – vlídná zpráva místo 404
    const exists = await prisma.saleEvent.findUnique({ where: { slug }, select: { name: true } })
    if (!exists) notFound()
    return (
      <section className="site-container py-16">
        <EmptyState
          title={`${exists.name} právě neprobíhá`}
          text="Tahle akce už skončila nebo teprve začne. Mrkněte na aktuální nabídku."
          link={{ text: 'Do obchodu', href: '/obchod' }}
        />
      </section>
    )
  }

  const products = await getProductCards({ sale, sort })
  const endsAt = sale.endsAt?.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <section className="bg-wine text-white">
        <div className="site-container grid items-stretch gap-8 py-12 md:grid-cols-2 md:py-0">
          <div className="flex flex-col justify-center md:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">Výprodej</p>
            <p className="display mt-6 text-[clamp(5rem,13vw,11rem)] leading-[0.82]">−{sale.discountPercent}%</p>
            <h1 className="display mt-6 text-[clamp(2.25rem,4.5vw,3.75rem)]">{sale.name}</h1>
            {sale.description && <p className="mt-5 max-w-lg text-lg text-white/85">{sale.description}</p>}
            {endsAt && <p className="mt-8 text-sm uppercase tracking-[0.16em] text-white/75">Platí do {endsAt}</p>}
          </div>
          {sale.bannerImage && (
            <div className="relative -mx-[clamp(1rem,4vw,3rem)] aspect-[4/3] overflow-hidden md:ml-0 md:aspect-auto md:min-h-[460px]">
              <SmartImage src={sale.bannerImage} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>
      <section className="site-container pt-10">
        <CatalogToolbar count={products.length} sort={sort} />
        {products.length > 0 ? (
          <ProductGrid products={products} variant={settings.productCardStyle} columns={settings.productGridColumns} />
        ) : (
          <EmptyState title="Vše rozebráno" text="Zlevněné kousky z této akce už jsou pryč." link={{ text: 'Do obchodu', href: '/obchod' }} />
        )}
      </section>
    </>
  )
}

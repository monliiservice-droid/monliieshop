import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getBasePrice, getProductCards } from '@/lib/catalog'
import { getCategoryPath, getCategoryTree, getEffectiveSizeType } from '@/lib/categories'
import { findBestSale, getActiveSales, isSeparatedSaleProduct } from '@/lib/sales'
import { applySaleDiscount } from '@/lib/pricing'
import { hasBraMeasurements } from '@/lib/product-types'
import { DEFAULT_SET_CONFIG, type SetConfiguration } from '@/lib/set-config-types'
import { getShopSettings } from '@/lib/site-settings-server'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { ProductGallery } from '@/components/product/product-gallery'
import { isAvailable, parseSizeOptions, resolveSizeType } from '@/lib/product-stock'
import { ProductPurchase } from '@/components/product/product-purchase'
import { ProductCard } from '@/components/site/product-card'
import { ScrollRow } from '@/components/site/scroll-row'
import { SectionHeading } from '@/components/sections/section-heading'

// Stránka se generuje na serveru a cachuje; změny z adminu se projeví hned (revalidace)
export const revalidate = 300

type Props = { params: Promise<{ id: string }> }

const getProduct = cache(async (id: string) => {
  const product = await prisma.product.findFirst({
    where: { id, isVisible: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      images: true,
      categoryId: true,
      isSet: true,
      setOptions: true,
      colors: true,
      hideWhenSoldOut: true,
      sizeType: true,
      sizeOptions: true,
      allowBackorder: true,
      backorderLeadTime: true,
      variants: { select: { size: true, color: true, stock: true } },
    },
  })
  // Vyprodaný produkt s volbou „skrýt při vyprodání“ se na e-shopu neukazuje (produkt na zakázku vyprodaný není)
  return product && !(product.hideWhenSoldOut && !isAvailable(product.stock, product.allowBackorder)) ? product : null
})

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) ?? fallback
  } catch {
    return fallback
  }
}

function shortDescription(product: { name: string; description: string | null }): string {
  const text = (product.description || `${product.name} – ručně šitý kousek z rodinné dílny Monlii.`).replace(/\s+/g, ' ').trim()
  return text.length > 160 ? `${text.slice(0, 157)}…` : text
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Produkt nenalezen | Monlii' }
  const images = parseJson<string[]>(product.images, [])
  const description = shortDescription(product)
  return {
    title: `${product.name} | Monlii`,
    description,
    alternates: { canonical: `/produkt/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      locale: 'cs_CZ',
      siteName: 'Monlii',
      url: `/produkt/${product.id}`,
      images: images.slice(0, 1).map((url) => ({ url, alt: product.name })),
    },
  }
}

const CARE_ITEMS = [
  'Prát v ruce nebo v pračce na 30 °C v síťce na prádlo',
  'Nesušit v sušičce, sušit volně rozložené',
  'Nežehlit krajku a gumy',
]

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const [tree, sales, settings] = await Promise.all([getCategoryTree(), getActiveSales(), getShopSettings()])
  const images = parseJson<string[]>(product.images, [])
  const colors = parseJson<{ name: string; hex: string }[]>(product.colors, [])
  const setConfig: SetConfiguration | null = product.isSet
    ? { ...DEFAULT_SET_CONFIG, ...parseJson<Partial<SetConfiguration>>(product.setOptions, {}) }
    : null
  const sizeType = resolveSizeType(product, getEffectiveSizeType(tree, product.categoryId))
  const sale = findBestSale(product, sales, tree)
  const path = getCategoryPath(tree, product.categoryId)
  // Produkt v akci s odděleným výpisem „patří“ do výprodeje, ne do své kategorie
  const separatedSale = isSeparatedSaleProduct(product, sales, tree)
  const basePrice = getBasePrice(product)
  const showMeasurements = hasBraMeasurements(product.isSet ? 'set' : sizeType)
  const isBralette = sizeType === 'bralette' || setConfig?.braType === 'bralette'

  const related = product.categoryId && !separatedSale
    ? (await getProductCards({ categoryIds: [product.categoryId], limit: 9 })).filter((p) => p.id !== product.id).slice(0, 8)
    : []

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: shortDescription(product),
    image: images.map((url) => new URL(url, baseUrl).toString()),
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Monlii' },
    ...(path.length > 0 && { category: path.map((c) => c.name).join(' > ') }),
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/produkt/${product.id}`,
      priceCurrency: 'CZK',
      price: sale ? applySaleDiscount(basePrice, sale.discountPercent) : basePrice,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : product.allowBackorder ? 'https://schema.org/BackOrder' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // "<" escapujeme, aby text z databáze nemohl ukončit <script> tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="site-container pt-6 md:pt-8">
        <Breadcrumbs
          items={[
            ...(separatedSale
              ? [
                  { label: 'Výprodej', href: '/vyprodej' },
                  { label: separatedSale.name, href: `/vyprodej/${separatedSale.slug}` },
                ]
              : [{ label: 'Obchod', href: '/obchod' }, ...path.map((c) => ({ label: c.name, href: `/obchod/${c.slug}` }))]),
            { label: product.name },
          ]}
        />
      </div>

      <section className="site-container grid gap-10 pt-6 md:grid-cols-12 md:gap-10 lg:gap-16">
        <div className="md:col-span-7">
          <ProductGallery images={images} name={product.name} />
        </div>

        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            {path.length > 0 && <p className="eyebrow mb-4">{path[path.length - 1].name}</p>}
            <h1 className="display text-[clamp(2.5rem,4.5vw,4rem)]">{product.name}</h1>

            <div className="mt-6">
              <ProductPurchase
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  stock: product.stock,
                  image: images[0] ?? null,
                  setConfig,
                  colors,
                  sizeOptions: parseSizeOptions(product.sizeOptions),
                  variants: product.variants,
                  allowBackorder: product.allowBackorder,
                  backorderLeadTime: product.backorderLeadTime,
                }}
                sizeType={sizeType}
                salePercent={sale?.discountPercent ?? null}
                saleName={sale?.name ?? null}
                showMeasureLink={showMeasurements}
              />
            </div>

            <div className="mt-10 divide-y divide-line border-y border-line">
              <details open className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold uppercase tracking-[0.14em]">
                  Popis
                  <span className="text-xl font-light transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">
                  {product.description || 'Ručně šitý kousek z naší dílny. Pro podrobnosti o materiálu nám klidně napište.'}
                </div>
              </details>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold uppercase tracking-[0.14em]">
                  Materiál a péče
                  <span className="text-xl font-light transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-ink-soft">
                  {CARE_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold uppercase tracking-[0.14em]">
                  Doprava a platba
                  <span className="text-xl font-light transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="mt-4 space-y-2 text-ink-soft">
                  <p>Zásilkovna Z-BOX 69 Kč, nad 2 500 Kč zdarma. Osobní odběr v Havířově nebo ve Frenštátu zdarma.</p>
                  <p>Platba QR kódem, dobírkou nebo při osobním odběru. Skladové kousky odesíláme do 3–5 dnů, šití na míru do 14 dnů.</p>
                  <Link href="/doprava" className="inline-block underline underline-offset-4">Více o dopravě</Link>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {showMeasurements && (
        <section id="jak-merit" className="site-container mt-24 scroll-mt-28">
          <div className="grid gap-10 border-t border-line pt-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="eyebrow mb-4">Velikosti</p>
              <h2 className="display text-[clamp(2rem,4vw,3.25rem)]">Jak si změřit velikost</h2>
              <p className="mt-6 leading-relaxed text-ink-soft">
                Měřte přímo na těle, nejlépe bez oblečení. Krejčovský metr veďte rovně a nepřitahujte ho. Když si nebudete
                jistí, <Link href="/kontakty" className="underline underline-offset-4">napište nám</Link> – rády poradíme
                nebo ušijeme na míru.
              </p>
            </div>
            <div className="relative md:col-span-6 md:col-start-7">
              <Image
                src={isBralette ? '/merici_tabulka_braletka.png' : '/merici_tabulka_kostice.png'}
                alt={isBralette ? 'Měřicí tabulka – braletka' : 'Měřicí tabulka – podprsenka s kosticí'}
                width={1080}
                height={1350}
                sizes="(min-width: 768px) 45vw, 100vw"
                className="h-auto w-full bg-white"
              />
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="site-container mt-24 overflow-hidden">
          <SectionHeading eyebrow="Ze stejné kolekce" title="Mohlo by se vám líbit" withArrows />
          <ScrollRow label="Podobné produkty">
            {related.map((p) => (
              <div key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[40vw] md:w-[30vw] xl:w-[22vw]">
                <ProductCard product={p} variant={settings.productCardStyle} />
              </div>
            ))}
          </ScrollRow>
        </section>
      )}
    </>
  )
}

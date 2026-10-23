import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { getDisplayPrice } from '@/lib/set-config-types'
import { ProductDetail } from '@/components/product-detail'

// Stránka se generuje na serveru a cachuje; změny z adminu se projeví do minuty
export const revalidate = 60

type Props = { params: Promise<{ id: string }> }

// cache() – metadata i stránka sdílí jeden dotaz do databáze
const getProduct = cache(async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      images: true,
      category: true,
      isSet: true,
      setOptions: true,
      colors: true,
    },
  })
})

function parseImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getPrice(product: { price: number; isSet: boolean; setOptions: string | null }): number {
  if (product.isSet && product.setOptions) {
    try {
      return getDisplayPrice(JSON.parse(product.setOptions))
    } catch {
      return product.price
    }
  }
  return product.price
}

function shortDescription(product: { name: string; description: string | null }): string {
  const text = (product.description || `${product.name} – ručně šité spodní prádlo Monlii.`)
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 160 ? `${text.slice(0, 157)}…` : text
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) {
    return { title: 'Produkt nenalezen | Monlii' }
  }

  const description = shortDescription(product)
  const images = parseImages(product.images)

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

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'
  const images = parseImages(product.images)

  // Strukturovaná data pro vyhledávače (cena, dostupnost, obrázky)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: shortDescription(product),
    image: images.map((url) => new URL(url, baseUrl).toString()),
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Monlii' },
    ...(product.category && { category: product.category }),
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/produkt/${product.id}`,
      priceCurrency: 'CZK',
      price: getPrice(product),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // "<" escapujeme, aby text z databáze nemohl ukončit <script> tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetail product={product} />
    </>
  )
}

import type { Metadata } from 'next'
import { getProductCards } from '@/lib/catalog'
import { parseSort } from '@/lib/catalog-params'
import { getCategoryTree, visibleChildren } from '@/lib/categories'
import { getPageHeaders, getShopSettings } from '@/lib/site-settings-server'
import { PageHero } from '@/components/site/page-hero'
import { CatalogToolbar } from '@/components/site/catalog-toolbar'
import { ProductGrid } from '@/components/site/product-grid'
import { EmptyState } from '@/components/site/empty-state'

export const metadata: Metadata = {
  title: 'Obchod | Monlii',
  description: 'Ručně šité prádlo a oblečení pro ženy, muže i děti z rodinné české dílny.',
  alternates: { canonical: '/obchod' },
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sort = parseSort((await searchParams).razeni)
  const [headers, settings, tree, products] = await Promise.all([
    getPageHeaders(),
    getShopSettings(),
    getCategoryTree(),
    getProductCards({ sort }),
  ])
  const header = headers.obchod

  return (
    <>
      <PageHero eyebrow={header.eyebrow} title={header.title} subtitle={header.subtitle} image={header.image} />
      <section className="site-container pt-10">
        <CatalogToolbar
          count={products.length}
          sort={sort}
          filters={[
            { label: 'Vše', href: '/obchod', active: true },
            ...visibleChildren(tree.roots).map((c) => ({ label: c.name, href: `/obchod/${c.slug}`, active: false })),
          ]}
        />
        {products.length > 0 ? (
          <ProductGrid products={products} variant={settings.productCardStyle} columns={settings.productGridColumns} />
        ) : (
          <EmptyState title="Brzy tu bude" text="Právě šijeme nové kousky. Zkuste to prosím za pár dní." />
        )}
      </section>
    </>
  )
}

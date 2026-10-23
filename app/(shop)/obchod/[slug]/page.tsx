import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductCards } from '@/lib/catalog'
import { parseSort } from '@/lib/catalog-params'
import {
  getCategoryPath,
  getCategoryTree,
  getDescendantIds,
  isCategoryPathVisible,
  visibleChildren,
} from '@/lib/categories'
import { getShopSettings } from '@/lib/site-settings-server'
import { PageHero } from '@/components/site/page-hero'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { CatalogToolbar } from '@/components/site/catalog-toolbar'
import { ProductGrid } from '@/components/site/product-grid'
import { EmptyState } from '@/components/site/empty-state'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getCategory(slug: string) {
  const tree = await getCategoryTree()
  const category = tree.bySlug.get(slug)
  if (!category || !isCategoryPathVisible(tree, category.id)) return null
  return { tree, category }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = await getCategory(slug)
  if (!found) return { title: 'Kategorie nenalezena | Monlii' }
  const path = getCategoryPath(found.tree, found.category.id).map((c) => c.name)
  return {
    title: `${path.join(' – ')} | Monlii`,
    description: found.category.description || `${path.join(' – ')}: ručně šité kousky z rodinné české dílny Monlii.`,
    alternates: { canonical: `/obchod/${slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const found = await getCategory(slug)
  if (!found) notFound()
  const { tree, category } = found
  const sort = parseSort((await searchParams).razeni)

  const [settings, products] = await Promise.all([
    getShopSettings(),
    getProductCards({ categoryIds: getDescendantIds(category), sort }),
  ])

  const path = getCategoryPath(tree, category.id)
  const root = path[0]

  // Filtry: podkategorie této kategorie, u koncové kategorie její sourozenci
  const children = visibleChildren(category.children)
  const parent = category.parentId ? tree.byId.get(category.parentId) : undefined
  const filterBase = children.length > 0 ? category : parent
  const filterItems = filterBase ? visibleChildren(filterBase.children) : []
  const filters = filterBase
    ? [
        { label: 'Vše', href: `/obchod/${filterBase.slug}`, active: filterBase.id === category.id },
        ...filterItems.map((c) => ({ label: c.name, href: `/obchod/${c.slug}`, active: c.id === category.id })),
      ]
    : []

  return (
    <>
      <PageHero
        eyebrow={path.length > 1 ? root.name : 'Kolekce'}
        title={category.name}
        subtitle={category.description}
        image={category.image}
      >
        <div className="mt-8">
          <Breadcrumbs
            items={[
              { label: 'Obchod', href: '/obchod' },
              ...path.map((c, i) => (i === path.length - 1 ? { label: c.name } : { label: c.name, href: `/obchod/${c.slug}` })),
            ]}
          />
        </div>
      </PageHero>
      <section className="site-container pt-10">
        <CatalogToolbar count={products.length} sort={sort} filters={filters} />
        {products.length > 0 ? (
          <ProductGrid products={products} variant={settings.productCardStyle} columns={settings.productGridColumns} />
        ) : (
          <EmptyState
            title="Právě šijeme"
            text={`V kategorii ${category.name} zatím nic není – nové kousky připravujeme.`}
            link={{ text: 'Prohlédnout celý obchod', href: '/obchod' }}
          />
        )}
      </section>
    </>
  )
}

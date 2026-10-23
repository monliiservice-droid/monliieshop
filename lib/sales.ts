// Výprodejové akce – které jsou právě aktivní a jakou slevu dávají konkrétnímu produktu.

import { cache } from 'react'
import { prisma } from './prisma'
import { getCategoryPath, type CategoryTree } from './categories'

export interface ActiveSale {
  id: string
  name: string
  slug: string
  description: string | null
  bannerImage: string | null
  discountPercent: number
  endsAt: Date | null
  scope: string
  showInMenu: boolean
  separateListing: boolean
  productIds: Set<string>
  categoryIds: Set<string>
}

export const getActiveSales = cache(async (): Promise<ActiveSale[]> => {
  const now = new Date()
  try {
    const events = await prisma.saleEvent.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      include: {
        products: { select: { id: true } },
        categories: { select: { id: true } },
      },
      orderBy: { startsAt: 'desc' },
    })
    return events.map((event) => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      bannerImage: event.bannerImage,
      discountPercent: event.discountPercent,
      endsAt: event.endsAt,
      scope: event.scope,
      showInMenu: event.showInMenu,
      separateListing: event.separateListing,
      productIds: new Set(event.products.map((p) => p.id)),
      categoryIds: new Set(event.categories.map((c) => c.id)),
    }))
  } catch (error) {
    console.error('Error loading sale events:', error)
    return []
  }
})

export function saleAppliesTo(
  sale: ActiveSale,
  product: { id: string; categoryId: string | null },
  tree: CategoryTree
): boolean {
  if (sale.scope === 'all') return true
  if (sale.scope === 'products') return sale.productIds.has(product.id)
  if (sale.scope === 'categories') {
    // Akce na kategorii platí i pro všechny její podkategorie
    return getCategoryPath(tree, product.categoryId).some((node) => sale.categoryIds.has(node.id))
  }
  return false
}

/** Produkt je v akci, která ho má ukazovat jen ve výprodeji (ne mezi běžnými produkty) */
export function isSeparatedSaleProduct(
  product: { id: string; categoryId: string | null },
  sales: ActiveSale[],
  tree: CategoryTree
): ActiveSale | null {
  return sales.find((sale) => sale.separateListing && saleAppliesTo(sale, product, tree)) ?? null
}

/** Nejvýhodnější aktivní akce pro produkt (při souběhu více akcí vyhrává vyšší sleva) */
export function findBestSale(
  product: { id: string; categoryId: string | null },
  sales: ActiveSale[],
  tree: CategoryTree
): ActiveSale | null {
  let best: ActiveSale | null = null
  for (const sale of sales) {
    if (saleAppliesTo(sale, product, tree) && (!best || sale.discountPercent > best.discountPercent)) {
      best = sale
    }
  }
  return best
}

export { applySaleDiscount } from './pricing'

// Katalog pro výpisy produktů (obchod, kategorie, výprodeje, sekce homepage).
// Ceny už obsahují aktivní výprodejové slevy.

import { prisma } from './prisma'
import { getDisplayPrice } from './set-config-types'
import { applySaleDiscount } from './pricing'
import { getCategoryPath, getCategoryTree, isCategoryPathVisible, type CategoryTree } from './categories'
import { findBestSale, getActiveSales, saleAppliesTo, type ActiveSale } from './sales'

export interface ProductCardData {
  id: string
  name: string
  image: string | null
  hoverImage: string | null
  price: number
  salePrice: number | null
  salePercent: number | null
  saleName: string | null
  inStock: boolean
  categoryName: string | null
  isNew: boolean
}

export type CatalogSort = 'default' | 'newest' | 'price_asc' | 'price_desc'

export interface CatalogQuery {
  categoryIds?: string[]
  sale?: ActiveSale
  onlySale?: boolean
  featured?: boolean
  limit?: number
  sort?: CatalogSort
}

const NEW_PRODUCT_DAYS = 30

function parseImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed.filter((i) => typeof i === 'string') : []
  } catch {
    return []
  }
}

/** Základní (nejnižší) cena produktu – u setů z konfigurace variant */
export function getBasePrice(product: { price: number; isSet: boolean; setOptions: string | null }): number {
  if (product.isSet && product.setOptions) {
    try {
      return getDisplayPrice(JSON.parse(product.setOptions)) || product.price
    } catch {
      return product.price
    }
  }
  return product.price
}

export async function getProductCards(query: CatalogQuery = {}): Promise<ProductCardData[]> {
  const [tree, sales] = await Promise.all([getCategoryTree(), getActiveSales()])

  let products
  try {
    products = await prisma.product.findMany({
      where: {
        isVisible: true,
        ...(query.categoryIds && { categoryId: { in: query.categoryIds } }),
        ...(query.featured && { isFeatured: true }),
      },
      orderBy: query.sort === 'newest'
        ? [{ createdAt: 'desc' }]
        : [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        images: true,
        categoryId: true,
        isSet: true,
        setOptions: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }

  const newSince = Date.now() - NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000

  let cards = products
    // Produkty ve skryté kategorii se ve výpisech neukazují
    .filter((p) => !p.categoryId || isCategoryPathVisible(tree, p.categoryId))
    .filter((p) => !query.sale || saleAppliesTo(query.sale, p, tree))
    .map((p) => toCard(p, tree, sales, newSince))

  if (query.onlySale) {
    cards = cards.filter((c) => c.salePrice !== null)
  }

  if (query.sort === 'price_asc' || query.sort === 'price_desc') {
    const dir = query.sort === 'price_asc' ? 1 : -1
    cards.sort((a, b) => dir * ((a.salePrice ?? a.price) - (b.salePrice ?? b.price)))
  }

  return query.limit ? cards.slice(0, query.limit) : cards
}

function toCard(
  p: {
    id: string
    name: string
    price: number
    stock: number
    images: string
    categoryId: string | null
    isSet: boolean
    setOptions: string | null
    createdAt: Date
  },
  tree: CategoryTree,
  sales: ActiveSale[],
  newSince: number
): ProductCardData {
  const images = parseImages(p.images)
  const price = getBasePrice(p)
  const sale = findBestSale(p, sales, tree)
  const path = getCategoryPath(tree, p.categoryId)
  return {
    id: p.id,
    name: p.name,
    image: images[0] ?? null,
    hoverImage: images[1] ?? null,
    price,
    salePrice: sale ? applySaleDiscount(price, sale.discountPercent) : null,
    salePercent: sale ? sale.discountPercent : null,
    saleName: sale ? sale.name : null,
    inStock: p.stock > 0,
    categoryName: path.length ? path[path.length - 1].name : null,
    isNew: p.createdAt.getTime() >= newSince,
  }
}

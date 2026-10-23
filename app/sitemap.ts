import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getCategoryTree, isCategoryPathVisible } from '@/lib/categories'
import { getActiveSales } from '@/lib/sales'
import { getShopSettings } from '@/lib/site-settings-server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://monlii.cz'
  const now = new Date()

  const staticPaths: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
    ['', 1.0, 'daily'],
    ['/obchod', 0.9, 'daily'],
    ['/o-nas', 0.6, 'monthly'],
    ['/kontakty', 0.5, 'monthly'],
    ['/doprava', 0.4, 'yearly'],
    ['/obchodni-podminky', 0.3, 'yearly'],
    ['/reklamace', 0.3, 'yearly'],
    ['/ochrana-osobnich-udaju', 0.3, 'yearly'],
  ]
  const entries: MetadataRoute.Sitemap = staticPaths.map(([path, priority, changeFrequency]) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  try {
    const [settings, tree, sales, products] = await Promise.all([
      getShopSettings(),
      getCategoryTree(),
      getActiveSales(),
      prisma.product.findMany({
        where: { isVisible: true, OR: [{ hideWhenSoldOut: false }, { stock: { gt: 0 } }, { allowBackorder: true }] },
        select: { id: true, updatedAt: true, categoryId: true },
      }),
    ])

    if (settings.subscriptionEnabled) {
      entries.push({ url: `${baseUrl}/predplatne`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 })
    }
    for (const category of tree.byId.values()) {
      if (isCategoryPathVisible(tree, category.id)) {
        entries.push({ url: `${baseUrl}/obchod/${category.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 })
      }
    }
    for (const sale of sales) {
      entries.push({ url: `${baseUrl}/vyprodej/${sale.slug}`, lastModified: now, changeFrequency: 'daily', priority: 0.7 })
    }
    for (const product of products) {
      if (!product.categoryId || isCategoryPathVisible(tree, product.categoryId)) {
        entries.push({ url: `${baseUrl}/produkt/${product.id}`, lastModified: product.updatedAt, changeFrequency: 'weekly', priority: 0.8 })
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return entries
}

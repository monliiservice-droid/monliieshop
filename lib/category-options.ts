// Klientské pomocné funkce pro práci se seznamem kategorií v administraci
import { isSizeType, type SizeType } from './product-types'

export interface CategoryOption {
  id: string
  name: string
  slug: string
  parentId: string | null
  sizeType: string | null
  isVisible: boolean
  sortOrder: number
  description?: string | null
  image?: string | null
  _count?: { products: number }
}

/** Kategorie seřazené jako strom s hloubkou zanoření a celou cestou (např. „Ženy › Spodní prádlo › Sety“) */
export function flattenCategories(categories: CategoryOption[]) {
  const children = new Map<string | null, CategoryOption[]>()
  for (const c of categories) {
    const key = c.parentId && categories.some((p) => p.id === c.parentId) ? c.parentId : null
    children.set(key, [...(children.get(key) || []), c])
  }
  const result: (CategoryOption & { depth: number; path: string })[] = []
  const walk = (parentId: string | null, depth: number, prefix: string) => {
    const nodes = (children.get(parentId) || []).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'cs')
    )
    for (const node of nodes) {
      const path = prefix ? `${prefix} › ${node.name}` : node.name
      result.push({ ...node, depth, path })
      walk(node.id, depth + 1, path)
    }
  }
  walk(null, 0, '')
  return result
}

export function effectiveSizeType(categories: CategoryOption[], categoryId: string | null | undefined): SizeType {
  const byId = new Map(categories.map((c) => [c.id, c]))
  let current = categoryId ? byId.get(categoryId) : undefined
  const seen = new Set<string>()
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    if (isSizeType(current.sizeType)) return current.sizeType
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return 'none'
}

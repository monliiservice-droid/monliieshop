// Strom kategorií – načtení, hledání podle slugu, zděděný typ velikostí.

import { cache } from 'react'
import { prisma } from './prisma'
import { isSizeType, type SizeType } from './product-types'

export interface CategoryNode {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  sizeType: string | null
  sortOrder: number
  isVisible: boolean
  children: CategoryNode[]
}

export interface CategoryTree {
  roots: CategoryNode[]
  byId: Map<string, CategoryNode>
  bySlug: Map<string, CategoryNode>
}

function buildTree(rows: Omit<CategoryNode, 'children'>[]): CategoryTree {
  const byId = new Map<string, CategoryNode>()
  const bySlug = new Map<string, CategoryNode>()
  for (const row of rows) {
    const node = { ...row, children: [] }
    byId.set(node.id, node)
    bySlug.set(node.slug, node)
  }
  const roots: CategoryNode[] = []
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  const sort = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'cs'))
    nodes.forEach((n) => sort(n.children))
  }
  sort(roots)
  return { roots, byId, bySlug }
}

export const getCategoryTree = cache(async (): Promise<CategoryTree> => {
  try {
    const rows = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        sizeType: true,
        sortOrder: true,
        isVisible: true,
      },
    })
    return buildTree(rows)
  } catch (error) {
    console.error('Error loading categories:', error)
    return buildTree([])
  }
})

/** Viditelné kategorie (skrytá kategorie skryje i své podkategorie) */
export function visibleChildren(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.filter((n) => n.isVisible)
}

/** Cesta od kořene ke kategorii (pro drobečkovou navigaci) */
export function getCategoryPath(tree: CategoryTree, categoryId: string | null | undefined): CategoryNode[] {
  const path: CategoryNode[] = []
  let current = categoryId ? tree.byId.get(categoryId) : undefined
  const seen = new Set<string>()
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    path.unshift(current)
    current = current.parentId ? tree.byId.get(current.parentId) : undefined
  }
  return path
}

/** ID kategorie a všech jejích podkategorií (pro výpis produktů celé větve) */
export function getDescendantIds(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(getDescendantIds)]
}

/** Typ velikostí kategorie – vlastní, nebo nejbližší nadřazené kategorie */
export function getEffectiveSizeType(tree: CategoryTree, categoryId: string | null | undefined): SizeType {
  for (const node of getCategoryPath(tree, categoryId).reverse()) {
    if (isSizeType(node.sizeType)) return node.sizeType
  }
  return 'none'
}

/** Kategorie je vidět jen tehdy, když jsou viditelné i všechny nadřazené */
export function isCategoryPathVisible(tree: CategoryTree, categoryId: string | null | undefined): boolean {
  return getCategoryPath(tree, categoryId).every((n) => n.isVisible)
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

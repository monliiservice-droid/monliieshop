import type { CatalogSort } from './catalog'

const SORTS: CatalogSort[] = ['default', 'newest', 'price_asc', 'price_desc']

export function parseSort(value: string | string[] | undefined): CatalogSort {
  return typeof value === 'string' && (SORTS as string[]).includes(value) ? (value as CatalogSort) : 'default'
}

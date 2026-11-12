import { cache } from 'react'
import { prisma } from './prisma'
import { DEFAULT_SECTION_DATA, isSectionType, normalizeSectionData, type Section } from './sections'
import { DEFAULT_PAGE_LAYOUTS, isContentPageKey } from './page-content'

/** Výchozí sekce stránky (nejsou v DB) – stránka tak funguje i před prvním uložením v builderu */
export function getDefaultSections(page: string): Section[] {
  if (!isContentPageKey(page)) return []
  return DEFAULT_PAGE_LAYOUTS[page].map((item, index) => ({
    id: `default-${index}`,
    type: item.type,
    isVisible: true,
    sortOrder: index,
    data: normalizeSectionData(item.type, { ...DEFAULT_SECTION_DATA[item.type], ...(item.data || {}) }),
  }))
}

export const getPageSections = cache(async (page: string): Promise<Section[]> => {
  try {
    const rows = await prisma.pageSection.findMany({
      where: { page },
      orderBy: { sortOrder: 'asc' },
    })
    if (rows.length === 0) {
      return getDefaultSections(page)
    }
    return rows
      .filter((row) => isSectionType(row.type))
      .map((row) => ({
        id: row.id,
        type: row.type as Section['type'],
        isVisible: row.isVisible,
        sortOrder: row.sortOrder,
        data: normalizeSectionData(row.type as Section['type'], row.data),
      }))
  } catch (error) {
    console.error('Error loading page sections:', error)
    return getDefaultSections(page)
  }
})

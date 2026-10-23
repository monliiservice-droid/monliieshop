import { cache } from 'react'
import { prisma } from './prisma'
import {
  DEFAULT_HOME_LAYOUT,
  DEFAULT_SECTION_DATA,
  isSectionType,
  normalizeSectionData,
  type Section,
} from './sections'

/** Výchozí sekce (nejsou v DB) – homepage tak funguje i před prvním uložením v builderu */
export function getDefaultSections(): Section[] {
  return DEFAULT_HOME_LAYOUT.map((item, index) => ({
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
    if (rows.length === 0 && page === 'home') {
      return getDefaultSections()
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
    return page === 'home' ? getDefaultSections() : []
  }
})

// Tabulky velikostí – vestavěné měřicí tabulky (public/) a výchozí tabulka podle typu velikostí

import type { SizeType } from './product-types'

export const BUILT_IN_SIZE_CHARTS = [
  { url: '/merici_tabulka_braletka.png', label: 'Měřicí tabulka – braletka' },
  { url: '/merici_tabulka_kostice.png', label: 'Měřicí tabulka – podprsenka s kosticí' },
]

/** Tabulka u produktu: vlastní, jinak u podprsenek a setů výchozí měřicí tabulka */
export function resolveSizeChart(custom: string | null, sizeType: SizeType, braType?: string): string | null {
  if (custom?.trim()) return custom.trim()
  if (sizeType === 'bralette' || (sizeType === 'set' && braType === 'bralette')) return BUILT_IN_SIZE_CHARTS[0].url
  if (sizeType === 'bra_wired' || sizeType === 'set') return BUILT_IN_SIZE_CHARTS[1].url
  return null
}

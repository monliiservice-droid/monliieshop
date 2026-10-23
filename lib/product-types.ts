// Typy velikostí – určují, jaké velikosti zákazník u produktu vybírá.
// Typ se nastavuje u kategorie (podkategorie ho může zdědit od nadřazené).

export type SizeType = 'bra_wired' | 'bralette' | 'set' | 'panties' | 'clothing' | 'kids' | 'none'

export const SIZE_TYPE_LABELS: Record<SizeType, string> = {
  bra_wired: 'Podprsenka s kosticí (obvod + košíček)',
  bralette: 'Braletka (obvod)',
  set: 'Set (podprsenka + kalhotky, konfigurace setu)',
  panties: 'Prádlo XS–XL',
  clothing: 'Oblečení XS–XXL',
  kids: 'Dětské velikosti 86–164',
  none: 'Bez velikostí',
}

export const SIZE_TYPES = Object.keys(SIZE_TYPE_LABELS) as SizeType[]

export function isSizeType(value: unknown): value is SizeType {
  return typeof value === 'string' && value in SIZE_TYPE_LABELS
}

// Velikosti pro různé typy produktů
export const SIZE_OPTIONS = {
  BRA_SIZE: ['XS', 'S', 'M', 'L', 'XL'] as const,
  BRA_CUP: ['MINI', 'SOFT', 'BALANCED', 'FULL', 'MAXI'] as const,
  STANDARD_SIZE: ['XS', 'S', 'M', 'L', 'XL'] as const,
  CLOTHING_SIZE: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const,
  KIDS_SIZE: ['86', '92', '98', '104', '110', '116', '122', '128', '134', '140', '146', '152', '158', '164'] as const,
} as const

export interface SizeField {
  name: string
  label: string
  options: readonly string[]
}

/**
 * Pole velikostí pro daný typ. U setu záleží na zvolené podprsence (braletka nemá košíček).
 */
export function getSizeFields(sizeType: SizeType, braType?: 'bralette' | 'wired' | 'both'): SizeField[] {
  switch (sizeType) {
    case 'bra_wired':
      return [
        { name: 'braSize', label: 'Velikost podprsenky', options: SIZE_OPTIONS.BRA_SIZE },
        { name: 'braCup', label: 'Velikost košíčku', options: SIZE_OPTIONS.BRA_CUP },
      ]
    case 'bralette':
      return [{ name: 'braSize', label: 'Velikost', options: SIZE_OPTIONS.BRA_SIZE }]
    case 'panties':
      return [{ name: 'size', label: 'Velikost', options: SIZE_OPTIONS.STANDARD_SIZE }]
    case 'clothing':
      return [{ name: 'size', label: 'Velikost', options: SIZE_OPTIONS.CLOTHING_SIZE }]
    case 'kids':
      return [{ name: 'size', label: 'Velikost (výška v cm)', options: SIZE_OPTIONS.KIDS_SIZE }]
    case 'set':
      if (braType === 'wired' || braType === 'both') {
        return [
          { name: 'braSize', label: 'Velikost podprsenky', options: SIZE_OPTIONS.BRA_SIZE },
          { name: 'braCup', label: 'Velikost košíčku', options: SIZE_OPTIONS.BRA_CUP },
          { name: 'pantiesSize', label: 'Velikost kalhotek', options: SIZE_OPTIONS.STANDARD_SIZE },
        ]
      }
      return [
        { name: 'braSize', label: 'Velikost podprsenky', options: SIZE_OPTIONS.BRA_SIZE },
        { name: 'pantiesSize', label: 'Velikost kalhotek', options: SIZE_OPTIONS.STANDARD_SIZE },
      ]
    case 'none':
    default:
      return []
  }
}

/** Typy, u kterých má smysl zobrazit měřicí tabulku podprsenek */
export function hasBraMeasurements(sizeType: SizeType): boolean {
  return sizeType === 'bra_wired' || sizeType === 'bralette' || sizeType === 'set'
}

// Labels pro zobrazení
export const SIZE_LABELS: Record<string, string> = {
  MINI: 'MINI',
  SOFT: 'SOFT',
  BALANCED: 'BALANCED',
  FULL: 'FULL',
  MAXI: 'MAXI',
}

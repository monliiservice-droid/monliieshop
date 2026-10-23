// Velikosti a sklad produktu – sdílené pro admin formulář, detail produktu i serverovou kontrolu objednávky.
//
// Sklad se vede buď jedním číslem za celý produkt, nebo po variantách „hlavní velikost × barva“
// (hlavní velikost = první pole velikostí: obvod podprsenky, XS–XXL, výška u dětí).
// Další pole (košíček, velikost kalhotek u setu) se jen omezují na povolené hodnoty.

import { getSizeFields, isSizeType, type SizeField, type SizeType } from './product-types'

export type SizeOptions = Record<string, string[]>

export interface StockVariant {
  size: string
  color: string
  stock: number
}

export function parseSizeOptions(value: unknown): SizeOptions {
  let parsed: unknown = value
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      return {}
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  const result: SizeOptions = {}
  for (const [key, list] of Object.entries(parsed as Record<string, unknown>)) {
    if (Array.isArray(list)) result[key] = list.filter((v): v is string => typeof v === 'string')
  }
  return result
}

/** Typ velikostí produktu: vlastní nastavení produktu, jinak z kategorie. Set má vždy typ „set“. */
export function resolveSizeType(product: { isSet: boolean; sizeType: string | null }, categorySizeType: SizeType): SizeType {
  if (product.isSet) return 'set'
  return isSizeType(product.sizeType) ? product.sizeType : categorySizeType
}

/** Pole velikostí s nabídkou omezenou na povolené hodnoty produktu (prázdný seznam = nic neomezeno). */
export function productSizeFields(
  sizeType: SizeType,
  sizeOptions: SizeOptions,
  braType?: 'bralette' | 'wired' | 'both'
): SizeField[] {
  return getSizeFields(sizeType, braType).map((field) => {
    const allowed = sizeOptions[field.name]
    if (!allowed || allowed.length === 0) return field
    return { ...field, options: field.options.filter((option) => allowed.includes(option)) }
  })
}

/** Název pole hlavní velikosti, podle které se vede sklad (null = typ bez velikostí). */
export function primarySizeField(sizeType: SizeType): string | null {
  return getSizeFields(sizeType, 'bralette')[0]?.name ?? null
}

export function findVariant<T extends StockVariant>(variants: T[], size: string, color: string): T | undefined {
  return variants.find((v) => v.size === size && v.color === color)
}

export function totalStock(variants: StockVariant[]): number {
  return variants.reduce((sum, v) => sum + Math.max(0, v.stock), 0)
}

/** Lze produkt (nebo variantu) koupit – je skladem, nebo se šije na zakázku. */
export function isAvailable(stock: number, allowBackorder: boolean): boolean {
  return stock > 0 || allowBackorder
}

import { DEFAULT_SET_CONFIG, type SetConfiguration } from './set-config-types'
import { parseSizeOptions, type SizeOptions, type StockVariant } from './product-stock'

export type Color = { name: string; hex: string }

export type StockMode = 'single' | 'variants'

/** Klíč buňky tabulky skladu (velikost × barva) */
export function stockCellKey(size: string, color: string): string {
  return `${size}\u0001${color}`
}

export interface ProductFormValues {
  name: string
  description: string
  price: string
  stock: string
  categoryId: string
  images: string[]
  colors: Color[]
  setConfig: SetConfiguration
  isVisible: boolean
  isFeatured: boolean
  hideWhenSoldOut: boolean
  /** '' = podle kategorie */
  sizeType: string
  sizeOptions: SizeOptions
  stockMode: StockMode
  /** Počet kusů v buňce tabulky, 'off' = kombinace se nenabízí */
  variantStock: Record<string, string>
  /** Velikosti a barvy, které měl produkt ve skladu při načtení – chybějící kombinace z nich se nenabízely */
  loadedSizes: string[]
  loadedColors: string[]
  allowBackorder: boolean
  backorderLeadTime: string
}

export const EMPTY_PRODUCT_VALUES: ProductFormValues = {
  name: '',
  description: '',
  price: '',
  stock: '1',
  categoryId: '',
  images: [],
  colors: [],
  setConfig: DEFAULT_SET_CONFIG,
  isVisible: true,
  isFeatured: false,
  hideWhenSoldOut: false,
  sizeType: '',
  sizeOptions: {},
  stockMode: 'variants',
  variantStock: {},
  loadedSizes: [],
  loadedColors: [],
  allowBackorder: false,
  backorderLeadTime: '',
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback
  try {
    return JSON.parse(value) ?? fallback
  } catch {
    return fallback
  }
}

/** Převod produktu z API na hodnoty formuláře */
export function productToFormValues(product: any): ProductFormValues {
  const variants: StockVariant[] = Array.isArray(product.variants) ? product.variants : []
  return {
    name: product.name ?? '',
    description: product.description ?? '',
    price: String(product.price ?? ''),
    stock: String(product.stock ?? 0),
    categoryId: product.categoryId ?? '',
    images: parseJson<string[]>(product.images, []),
    colors: parseJson<Color[]>(product.colors, []),
    setConfig: product.isSet ? { ...DEFAULT_SET_CONFIG, ...parseJson(product.setOptions, {}) } : DEFAULT_SET_CONFIG,
    isVisible: product.isVisible !== false,
    isFeatured: product.isFeatured === true,
    hideWhenSoldOut: product.hideWhenSoldOut === true,
    sizeType: product.sizeType ?? '',
    sizeOptions: parseSizeOptions(product.sizeOptions),
    // Starší produkty bez variant mají sklad jedním číslem
    stockMode: variants.length > 0 ? 'variants' : 'single',
    variantStock: Object.fromEntries(variants.map((v) => [stockCellKey(v.size, v.color), String(v.stock)])),
    loadedSizes: [...new Set(variants.map((v) => v.size))],
    loadedColors: [...new Set(variants.map((v) => v.color))],
    allowBackorder: product.allowBackorder === true,
    backorderLeadTime: product.backorderLeadTime ?? '',
  }
}


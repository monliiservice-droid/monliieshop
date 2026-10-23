import { DEFAULT_SET_CONFIG, type SetConfiguration } from './set-config-types'

export type Color = { name: string; hex: string }

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
  }
}


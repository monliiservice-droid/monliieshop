// Parsování a validace vstupů z administrace
import { slugify } from './categories'
import { isSizeType } from './product-types'
import { cleanText, optionalText } from './admin-api'
import { parseSizeOptions, totalStock, type StockVariant } from './product-stock'

export function parseCategoryInput(body: any) {
  const name = cleanText(body?.name, 100)
  const slug = slugify(cleanText(body?.slug, 100) || name)
  const sizeType = isSizeType(body?.sizeType) ? body.sizeType : null
  return {
    name,
    slug,
    description: optionalText(body?.description, 2000),
    image: optionalText(body?.image, 500),
    parentId: optionalText(body?.parentId, 50),
    sizeType,
    sortOrder: Number.isFinite(Number(body?.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : 0,
    isVisible: body?.isVisible !== false,
  }
}

const SALE_SCOPES = ['all', 'categories', 'products'] as const

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function idList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.length < 50) : []
}

export function parseSaleInput(body: any) {
  const name = cleanText(body?.name, 120)
  const scope = SALE_SCOPES.includes(body?.scope) ? (body.scope as (typeof SALE_SCOPES)[number]) : 'all'
  const discountPercent = Number(body?.discountPercent)
  return {
    data: {
      name,
      slug: slugify(cleanText(body?.slug, 120) || name),
      description: optionalText(body?.description, 2000),
      bannerImage: optionalText(body?.bannerImage, 500),
      discountPercent: Number.isFinite(discountPercent) ? discountPercent : NaN,
      startsAt: parseDate(body?.startsAt) ?? new Date(),
      endsAt: parseDate(body?.endsAt),
      isActive: body?.isActive !== false,
      showInMenu: body?.showInMenu !== false,
      separateListing: body?.separateListing === true,
      scope,
    },
    productIds: scope === 'products' ? idList(body?.productIds) : [],
    categoryIds: scope === 'categories' ? idList(body?.categoryIds) : [],
  }
}

export function validateSale(input: ReturnType<typeof parseSaleInput>): string | null {
  const { data } = input
  if (!data.name || !data.slug) return 'Vyplňte název výprodeje'
  if (!(data.discountPercent > 0 && data.discountPercent < 100)) return 'Sleva musí být mezi 1 a 99 %'
  if (data.endsAt && data.endsAt <= data.startsAt) return 'Konec výprodeje musí být po jeho začátku'
  if (data.scope === 'products' && input.productIds.length === 0) return 'Vyberte alespoň jeden produkt'
  if (data.scope === 'categories' && input.categoryIds.length === 0) return 'Vyberte alespoň jednu kategorii'
  return null
}

function jsonArrayString(value: unknown): string {
  if (typeof value !== 'string') return '[]'
  try {
    return Array.isArray(JSON.parse(value)) ? value : '[]'
  } catch {
    return '[]'
  }
}

const MAX_VARIANTS = 300

/** Sklad po variantách (velikost × barva). Neplatné řádky a duplicity se zahodí, null = neplatný počet kusů. */
function parseVariants(value: unknown): StockVariant[] | null {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const result: StockVariant[] = []
  for (const raw of value.slice(0, MAX_VARIANTS)) {
    const size = typeof raw?.size === 'string' ? raw.size.trim().slice(0, 30) : ''
    const color = typeof raw?.color === 'string' ? raw.color.trim().slice(0, 60) : ''
    const stock = Number(raw?.stock)
    if (!Number.isInteger(stock) || stock < 0) return null
    const key = `${size}\u0000${color}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ size, color, stock })
  }
  return result
}

export function parseProductInput(body: any) {
  const price = Number(body?.price)
  const variants = parseVariants(body?.variants)
  // Se skladem po variantách je sklad produktu jejich součtem
  const stock = variants && variants.length > 0 ? totalStock(variants) : Number(body?.stock)
  const sizeOptions = parseSizeOptions(body?.sizeOptions)
  return {
    data: {
      name: cleanText(body?.name, 200),
      description: optionalText(body?.description, 10000),
      price: Number.isFinite(price) && price >= 0 ? price : NaN,
      stock: Number.isInteger(stock) && stock >= 0 ? stock : NaN,
      images: jsonArrayString(body?.images),
      categoryId: optionalText(body?.categoryId, 50),
      isSet: body?.isSet === true,
      setOptions: typeof body?.setOptions === 'string' ? body.setOptions : '{}',
      colors: jsonArrayString(body?.colors),
      isVisible: body?.isVisible !== false,
      isFeatured: body?.isFeatured === true,
      hideWhenSoldOut: body?.hideWhenSoldOut === true,
      sizeType: isSizeType(body?.sizeType) ? (body.sizeType as string) : null,
      sizeOptions: JSON.stringify(sizeOptions),
      allowBackorder: body?.allowBackorder === true,
      backorderLeadTime: optionalText(body?.backorderLeadTime, 60),
      // Pořadí se mění jen když ho klient opravdu pošle (jinak by se při úpravě vynulovalo)
      ...(Number.isInteger(body?.sortOrder) && { sortOrder: body.sortOrder as number }),
    },
    // undefined = klient varianty neposlal (např. jen přepnutí viditelnosti) → sklad po variantách zůstane beze změny
    variants: body?.variants === undefined ? undefined : variants,
  }
}

export function validateProduct(input: ReturnType<typeof parseProductInput>): string | null {
  const { data, variants } = input
  if (!data.name) return 'Vyplňte název produktu'
  if (Number.isNaN(data.price)) return 'Zadejte platnou cenu'
  if (variants === null) return 'Počty kusů skladem musí být celá nezáporná čísla'
  if (Number.isNaN(data.stock)) return 'Zadejte platný počet kusů skladem'
  return null
}
